import * as dgraph from 'dgraph-js-http'
import $ from "jquery";

window.CodeMirror = require('codemirror');
import 'codemirror/lib/codemirror.css';
import '../css/runnable.css';

import javascript from 'codemirror/mode/javascript/javascript';

// Stores reference to the codemirror for the page
let codeMirror;

// Key in localStorage of the server URL string.
const SERVER_ADDR = 'tourDgraphAddr';

let serverAddress = localStorage.getItem(SERVER_ADDR) || "http://localhost:8080";

changeServerAddress(serverAddress);

function changeServerAddress(newAddr) {
  serverAddress = newAddr;
  localStorage.setItem(SERVER_ADDR, newAddr);
  $('.runnable .pane-title .url').text(newAddr);
  $('input#inputDgraphUrl').val(newAddr);
}

function initCodeMirror($runnable) {
  $runnable.find(".CodeMirror").remove();

  var editableEl = $runnable.find(".query-content-editable")[0];
  codeMirror = CodeMirror.fromTextArea(editableEl, {
    lineNumbers: true,
    autoCloseBrackets: true,
    lineWrapping: true,
    autofocus: false,
    tabSize: 2
  });

  codeMirror.on("change", function(c) {
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

function formatMs(ns) {
  return (ns / 1e6).toFixed(0);
}

function getLatencyTooltipHTML(serverLatencyInfo, networkLatency) {
  return `
    <div class="latency-tooltip-container">
      <div class="measurement-row">
        <div class="measurement-key">Encoding:</div>
        <div class="measurement-val">
          ${formatMs(serverLatencyInfo.encoding_ns || 0)}
        </div>
      </div>
      <div class="measurement-row">
        <div class="measurement-key">Parsing:</div>
        <div class="measurement-val">
          ${formatMs(serverLatencyInfo.parsing_ns)}
        </div>
      </div>
      <div class="measurement-row">
        <div class="measurement-key">Processing:</div>
        <div class="measurement-val">
          ${formatMs(serverLatencyInfo.processing_ns)}
        </div>
      </div>
      <div class="divider"></div>
      <div class="measurement-row">
        <div class="measurement-key total">Total:</div>
        <div class="measurement-val">
          ${formatMs(serverLatencyInfo.total_ns)}
        </div>
      </div>
    </div>
  `;
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
  serverLatencyInfo.total_ns = Object.values(serverLatencyInfo).reduce((x, y) => x + y, 0);

  const totalServerLatency =  serverLatencyInfo.total_ns / 1e6;

  const networkOnlyLatency = Math.round(networkLatency - totalServerLatency);

  $runnable.find('.latency-info').removeClass('hidden');
  $runnable.find('.server-latency .number').text(formatMs(serverLatencyInfo.total_ns) + 'ms');
  $runnable.find('.network-latency .number').text(networkOnlyLatency + 'ms');

  const tooltipHTML = getLatencyTooltipHTML(
    serverLatencyInfo,
    networkOnlyLatency
  );

  // TODO: where did .tooltip plugin go?
  // $runnable
  //   .find(".server-latency-tooltip-trigger")
  //   .attr("title", tooltipHTML)
  //   .tooltip();
}

function displayOutput(codeEl, res) {
  var userOutput = JSON.stringify(res, null, 2);

  codeEl.text(userOutput);
  for (var i = 0; i < codeEl.length; i++) {
    window.hljs.highlightBlock(codeEl[i]);
  }
}

// Running code
$(document).on('click', '.runnable [data-action="run"]', async function(e) {
  var $currentRunnable = $(this).closest('.runnable');
  var codeEl = $currentRunnable.find('.output');
  var query = $(this)
    .closest('.runnable')
    .attr('data-current');
  var endpoint = $(this)
    .closest('.runnable')
    .attr('endpoint');

  $currentRunnable.find(".output-container").removeClass("empty error");
  codeEl.text("Waiting for the server response...");

  const startTime = Date.now();

  const method = endpoint.substring(1);
  const stub = new dgraph.DgraphClientStub(serverAddress)
  const client = new dgraph.DgraphClient(stub)
  client.setDebugMode(true)
  try {
    // TODO: this should be done once per URL, but good enough for now.
    await stub.detectApiVersion();
  } catch (e) {
    // Ignore errors while detecting version - real request will handle errors
  }

  let request = null;
  switch (endpoint) {
    case '/query':
      request = client.newTxn().query(query);
      break;
    case '/alter':
      request = client.alter({ schema: query });
      break;
    case '/mutate':
      request = client.newTxn().mutate({
        commitNow: true,
        mutation: query,
      });
  }

  try {
    const res = await request;
    const networkLatency = Date.now() - startTime;
    let serverLatencyInfo = null;
    if (res.extensions && res.extensions.server_latency) {
      serverLatencyInfo = res.extensions.server_latency;
    }

    // In some cases, the server does not return latency information
    // TODO: find better ways to check for errors or fix dgraph to make the
    // response consistent
    var resSuccess = !res.code || !/Error/i.test(res.code);

    if (!resSuccess) {
      $currentRunnable.find('.output-container').addClass('error');
    }

    displayOutput(codeEl, res);

    if (resSuccess && serverLatencyInfo) {
      updateLatencyInformation(
        $currentRunnable,
        serverLatencyInfo,
        networkLatency
      );
    }
  } catch (error) {
    $currentRunnable.find('.output-container').addClass('error');
    // Ideally we should check that xhr.status === 404, but because we are doing
    // CORS, status is always 0
    var defaultError = 'Error: Is Dgraph running locally?';
    let message = error || defaultError;

    codeEl.text(message);
  }
});

$(document).on('click', '.runnable a.btn-change', async function(e) {
  e.preventDefault();
  $('.runnable-url-modal.modal').addClass('show');
})

$(document).on('click', '.runnable-url-modal button[data-dismiss="modal"]', async function(e) {
  $('.runnable-url-modal.modal').removeClass('show');
})

$(document).on('click', '.runnable-url-modal button[data-action=apply]', async function(e) {
  $('.runnable-url-modal.modal').removeClass('show');
  changeServerAddress($('input#inputDgraphUrl').val())
})

$(document).on('click', '.runnable-url-modal button[data-action=default-url]', async function(e) {
  changeServerAddress("http://localhost:8080")
})

// Refresh code
$(document).on("click", '.runnable [data-action="reset"]', function(e) {
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

$(document).on("click", ".runnable-content.runnable-code", () => codeMirror.focus());

// Initialize runnables
$(".runnable").each(function() {
  // First, we reinitialize the query contents because some languages require
  // specific formatting
  var $runnable = $(this);
  var currentQuery = $runnable.attr("data-current");
  updateQueryContents($runnable, currentQuery);

  initCodeMirror($runnable);
});
