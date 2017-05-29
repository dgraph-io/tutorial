/**
 * JS for runnable component
 */

// cm stores reference to the codemirror for the page
var cm;

(function() {
  function initCodeMirror($runnable) {
    $runnable.find(".CodeMirror").remove();

    var editableEl = $runnable.find(".query-content-editable")[0];
    cm = CodeMirror.fromTextArea(editableEl, {
      lineNumbers: true,
      autoCloseBrackets: true,
      lineWrapping: true,
      autofocus: false,
      tabSize: 2
    });

    cm.on("change", function(c) {
      var val = c.doc.getValue();
      $runnable.attr("data-current", val);
      c.save();
    });
  }

  // updateQueryContents updates the query contents in all tabs
  function updateQueryContents($runnables, newQuery) {
    var cleanValue = newQuery.trim().replace(/\n$/g, "");

    $runnables.find(".query-content").text(cleanValue);
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
      "</div></div>";
    var outputHTML =
      '<div class="latency-tooltip-container">' + contentHTML + "</div>";

    return outputHTML;
  }

  function getTotalServerLatencyInMS(serverLatencyInfo) {
    var totalServerLatency = serverLatencyInfo.total;

    var unit = totalServerLatency.slice(-2);
    var val = totalServerLatency.slice(0, -2);

    if (unit === "µs") {
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
    var isModal = $runnable.parents("#runnable-modal").length > 0;

    var totalServerLatency = getTotalServerLatencyInMS(serverLatencyInfo);
    var networkOnlyLatency = Math.round(networkLatency - totalServerLatency);

    $runnable.find(".latency-info").removeClass("hidden");
    $runnable.find(".server-latency .number").text(serverLatencyInfo.total);
    $runnable.find(".network-latency .number").text(networkOnlyLatency + "ms");

    var tooltipHTML = getLatencyTooltipHTML(
      serverLatencyInfo,
      networkOnlyLatency
    );

    $runnable
      .find(".server-latency-tooltip-trigger")
      .attr("title", tooltipHTML)
      .tooltip();
  }

  // Running code
  $(document).on("click", '.runnable [data-action="run"]', function(e) {
    e.preventDefault();

    var $currentRunnable = $(this).closest(".runnable");
    var codeEl = $currentRunnable.find(".output");
    var query = $(this).closest(".runnable").attr("data-current");

    $currentRunnable.find(".output-container").removeClass("empty error");
    codeEl.text("Waiting for the server response...");

    var startTime;
    // TODO: For visualization, we might need debug mode
    // However we should not show it to the user in the JSON output
    $.post({
      url: "http://127.0.0.1:8080/query?latency=true",
      data: query,
      dataType: "json",
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
        if ((!res.code || !/Error/i.test(res.code)) && serverLatencyInfo) {
          updateLatencyInformation(
            $currentRunnable,
            serverLatencyInfo,
            networkLatency
          );
        }

        var userOutput = JSON.stringify(res, null, 2);
        codeEl.text(userOutput);
        for (var i = 0; i < codeEl.length; i++) {
          hljs.highlightBlock(codeEl[i]);
        }
      })
      .fail(function(xhr, status, error) {
        $currentRunnable.find(".output-container").addClass("error");
        // Ideally we should check that xhr.status === 404, but because we are doing
        // CORS, status is always 0
        var defaultError = "Error: Is Dgraph running locally?";

        codeEl.text(xhr.responseText || error || defaultError);
      });
  });

  // Refresh code
  $(document).on("click", '.runnable [data-action="reset"]', function(e) {
    e.preventDefault();

    var $runnable = $(this).closest(".runnable");
    var initialQuery = $runnable.data("initial");

    $runnable.attr("data-current", initialQuery);
    $runnable
      .find(".query-content-editable")
      .val(initialQuery)
      .text(initialQuery);

    initCodeMirror($runnable);

    window.setTimeout(function() {
      $runnable.find(".query-content-editable").text(initialQuery);
    }, 80);
  });

  $(document).on("click", ".runnable-content.runnable-code", function(e) {
    e.preventDefault();

    cm.focus();
  });

  /********** On page load **/

  // Initialize runnables
  $(".runnable").each(function() {
    // First, we reinitialize the query contents because some languages require
    // specific formatting
    var $runnable = $(this);
    var currentQuery = $runnable.attr("data-current");
    updateQueryContents($runnable, currentQuery);

    initCodeMirror($runnable);
  });
})();
