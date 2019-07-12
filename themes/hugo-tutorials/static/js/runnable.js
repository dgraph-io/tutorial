/**
 * JS for runnable component
 */

// --- START: RunnableUrl ---
import { RunnableUrl } from './runnable-url/index.js';
import {
  InitRunnableUrlView,
  runnableUrl,
  runnableUrlEndpointButton
} from './runnable-url/view.js';
InitRunnableUrlView();
// --- END:   RunnableUrl ---

// cm stores reference to the codemirror for the page
var cm;

const headersDefgraphqlpm = { 'Content-Type': 'application/graphql+-' }
const headersDefRDF = { 'Content-Type': 'application/rdf' }

export default function runnable() {
  function initCodeMirror($runnable) {
    $runnable.find('.CodeMirror').remove();

    var editableEl = $runnable.find('.query-content-editable')[0];
    cm = CodeMirror.fromTextArea(editableEl, {
      lineNumbers: true,
      autoCloseBrackets: true,
      lineWrapping: true,
      autofocus: false,
      tabSize: 2
    });

    cm.on('change', function(c) {
      var val = c.doc.getValue();
      $runnable.attr('data-current', val);
      c.save();
    });
  }

  // updateQueryContents updates the query contents in all tabs
  function updateQueryContents($runnables, newQuery) {
    var cleanValue = newQuery.trim().replace(/\n$/g, '');

    $runnables.find('.query-content').text(cleanValue);
  }

  function getLatencyTooltipHTML(serverLatencyInfo, networkLatency) {
    var contentHTML =
      '<div class="measurement-row"><div class="measurement-key">JSON:</div><div class="measurement-val">' +
      serverLatencyInfo.json +
      '</div></div><div class="measurement-row"><div class="measurement-key">Parsing:</div><div class="measurement-val">' +
      serverLatencyInfo.parsing +
      '</div></div><div class="measurement-row"><div class="measurement-key">Processing:</div><div class="measurement-val">' +
      serverLatencyInfo.processing +
      '</div></div><div class="divider"></div><div class="measurement-row"><div class="measurement-key total">Total:</div><div class="measurement-val">' +
      serverLatencyInfo.total +
      '</div></div>';
    var outputHTML =
      '<div class="latency-tooltip-container">' + contentHTML + '</div>';

    return outputHTML;
  }

  function getTotalServerLatencyInMS(serverLatencyInfo) {
    var totalServerLatency = serverLatencyInfo.total;

    var unit = totalServerLatency.slice(-2);
    var val = totalServerLatency.slice(0, -2);

    if (unit === 'µs') {
      return val / 1000;
    }

    // else assume 'ms'
    return val;
  }

  /**
   * updateLatencyInformation update the latency information displayed in the
   * $runnable.
   *
   * @params $runnable {JQueryElement}
   * @params serverLatencyInfo {Object} - latency info returned by the server
   * @params networkLatency {Number} - network latency in milliseconds
   */
  function updateLatencyInformation(
    $runnable,
    serverLatencyInfo,
    networkLatency
  ) {
    var isModal = $runnable.parents('#runnable-modal').length > 0;

    var totalServerLatency = getTotalServerLatencyInMS(serverLatencyInfo);
    var networkOnlyLatency = Math.round(networkLatency - totalServerLatency);

    $runnable.find('.latency-info').removeClass('hidden');
    $runnable.find('.server-latency .number').text(serverLatencyInfo.total);
    $runnable.find('.network-latency .number').text(networkOnlyLatency + 'ms');

    var tooltipHTML = getLatencyTooltipHTML(
      serverLatencyInfo,
      networkOnlyLatency
    );

    $runnable
      .find('.server-latency-tooltip-trigger')
      .attr('title', tooltipHTML)
      .tooltip();
  }

  function isFirefox() {
    return navigator.userAgent.indexOf(' Firefox/') >= 0;
  }

  function dgraphPost(params) {
    return $.post({
      url: params.endpoint == "/mutate" ? params.url + "?commitNow=true" : params.url,
      data: params.query,
      dataType: 'json',
      headers: params.endpoint == "/mutate" ? headersDefRDF : headersDefgraphqlpm,
    //  TODO: Re-evaluate compatibility with Firefox.
    //  headers: isFirefox() ? undefined : { 'X-Dgraph-CommitNow': 'true' },
      beforeSend: params.beforeSend
    });
  }

  function commitTxn(resp) {
    var txn = resp.extensions && resp.extensions.txn;
    if (!txn || !txn.keys || !txn.keys.length) {
      // Nothing to commit.
      var commitRes = $.Deferred();
      commitRes.resolve('<Nothing to commit>');
      return commitRes;
    }
    // Default URL.
    var url = 'http://127.0.0.1:8080/commit/' + txn.start_ts;
    if (RUNNABLE_URL_CONFIG.enabled) {
      // Inject customized URL with path overrides.
      url = RunnableUrl.factory(runnableUrl, {
        pathName: `/commit/${txn.start_ts}`
      }).url;
    }
    return $.post({
      url: url,
      data: JSON.stringify(txn.keys),
      dataType: 'json'
    });
  }

  function displayOutput(codeEl, res, commitRes, commitError) {
    var userOutput = JSON.stringify(res, null, 2);
    if (isFirefox()) {
      if (commitRes) {
        userOutput += '\n-----\nCOMMIT response (Firefox only):\n\n';
        userOutput += JSON.stringify(commitRes, null, 2);
      } else if (commitError) {
        userOutput += '\n-----\nCOMMIT ERROR (Firefox only):\n\n';
        userOutput += JSON.stringify(commitError, null, 2);
      }
    }

    codeEl.text(userOutput);
    for (var i = 0; i < codeEl.length; i++) {
      hljs.highlightBlock(codeEl[i]);
    }
  }

  // Running code
  $(document).on('click', '.runnable [data-action="run"]', function(e) {
    e.preventDefault();

    var $currentRunnable = $(this).closest('.runnable');
    var codeEl = $currentRunnable.find('.output');
    var query = $(this)
      .closest('.runnable')
      .attr('data-current');
    var endpoint = $(this)
      .closest('.runnable')
      .attr('endpoint');

    $currentRunnable.find('.output-container').removeClass('empty error');
    codeEl.text('Waiting for the server response...');

    var startTime;

    // Set default url.
    var url = 'http://127.0.0.1:8080' + endpoint + '?latency=true';
    // Update URL if customization enabled.
    if (RUNNABLE_URL_CONFIG.enabled) {
      // Create temporary instance that includes statics params within generated URL.
      // In this case, useful for adding `latency=true` searchParam onto posted URL while hiding it from UI.
     // url = RunnableUrl.factory(runnableUrl, runnableUrl.statics).url;
      // TODO: I needed to remove latency, as this parameter is not supported in the new API change. As far as I know.
      url = RunnableUrl.factory(runnableUrl).url;
      // Set endpoint to customized pathName for later processing.
      endpoint = runnableUrl.pathName;
    }

    // TODO: For visualization, we might need debug mode
    // However we should not show it to the user in the JSON output
    dgraphPost({
      query: query,
      url: url,
      endpoint,
      beforeSend: function() {
        startTime = new Date().getTime();
      }
    })
      .done(function(res) {
        var now = new Date().getTime();
        var networkLatency = now - startTime;
        var serverLatencyInfo = res.server_latency;
        delete res.server_latency;

        // In some cases, the server does not return latency information
        // TODO: find better ways to check for errors or fix dgraph to make the
        // response consistent
        var resSuccess = !res.code || !/Error/i.test(res.code);

        if (!resSuccess) {
          $currentRunnable.find('.output-container').addClass('error');
        }

        if (resSuccess && endpoint === '/mutate' && isFirefox()) {
          commitTxn(res)
            .done(function(commitResult) {
              if (!commitResult.errors) {
                displayOutput(codeEl, res, commitResult);
              } else {
                $currentRunnable.find('.output-container').addClass('error');
                displayOutput(codeEl, res, null, commitResult);
              }
            })
            .fail(function(xhr, status, error) {
              $currentRunnable.find('.output-container').addClass('error');
              var defaultError = 'Error: Is Dgraph running locally?';
              var message = xhr.responseText || error || defaultError;
              // Alter error message if RunnableUrl is enabled.
              if (RUNNABLE_URL_CONFIG.enabled) {
                message += `\n${runnableUrl.errorMessage}`;
                runnableUrlEndpointButton.blink();
              }
              displayOutput(
                codeEl,
                res,
                null,
                'Failed to POST to /commit: ' + message
              );
            });
        } else {
          displayOutput(codeEl, res);
        }

        if (resSuccess && serverLatencyInfo) {
          updateLatencyInformation(
            $currentRunnable,
            serverLatencyInfo,
            networkLatency
          );
        }
      })
      .fail(function(xhr, status, error) {
        $currentRunnable.find('.output-container').addClass('error');
        // Ideally we should check that xhr.status === 404, but because we are doing
        // CORS, status is always 0
        var defaultError = 'Error: Is Dgraph running locally?';
        let message = xhr.responseText || error || defaultError;
        // Alter error message if RunnableUrl is enabled.
        if (RUNNABLE_URL_CONFIG.enabled) {
          message += `\n${runnableUrl.errorMessage}`;
          runnableUrlEndpointButton.blink();
        }
        codeEl.text(message);
      });
  });

  // Refresh code
  $(document).on('click', '.runnable [data-action="reset"]', function(e) {
    e.preventDefault();

    var $runnable = $(this).closest('.runnable');
    var initialQuery = $runnable.data('initial');

    $runnable.attr('data-current', initialQuery);
    $runnable
      .find('.query-content-editable')
      .val(initialQuery)
      .text(initialQuery);

    initCodeMirror($runnable);

    window.setTimeout(function() {
      $runnable.find('.query-content-editable').text(initialQuery);
    }, 80);
  });

  $(document).on('click', '.runnable-content.runnable-code', function(e) {
    e.preventDefault();

    cm.focus();
  });

  /********** On page load **/

  // Initialize runnables
  $('.runnable').each(async function() {
    // First, we reinitialize the query contents because some languages require
    // specific formatting
    var $runnable = $(this);
    var currentQuery = $runnable.attr('data-current');
    updateQueryContents($runnable, currentQuery);

    initCodeMirror($runnable);
  });
}

runnable();
