import $ from "jquery";

$('#tour-release').change(function(e) {
  var dest = e.target.value;
  if (dest == DgTour.thisRelease) {
    return
  }
  if (dest == DgTour.latestRelease) {
    window.location.href = "/"
    return
  }
  if (dest != "master") {
    dest = "dgraph-" + dest
  }
  window.location.href = "/" + dest
});


$(document).on('click', 'a[data-action="toggle-expandable"]', function(e) {
  e.preventDefault();
  var $toggle = $(this);
  var $expandable = $(this).closest('.expandable');

  $expandable.toggleClass('expanded');

  var isExpanded = $expandable.hasClass('expanded');
  if (isExpanded) {
    $toggle.html("<i class='fa fa-caret-up'></i> Hide answer");
  } else {
    $toggle.html("<i class='fa fa-caret-down'></i> Show answer");
  }
});

$(document).on('click', 'a[data-action="toggle-sidebar"]', function (e) {
  e.preventDefault();
  e.stopPropagation();

  var $sidebar = $('#sidebar');
  $sidebar.toggleClass('hidden');

  var isShown = !$sidebar.hasClass('hidden');
  if (isShown) {
    $(".topic.active")[0].scrollIntoView();
  }
});

$(document).on('click', '.categories .category', function (e) {
  var $topicList = $(this).siblings('.topics');
  $topicList.toggleClass('open');
  e.stopPropagation();
});

$(document).on('click', 'body', function (e) {
  // Collapse sidebar if open
  $('#sidebar').addClass('hidden');
});

var KEY_RIGHT = 39;
var KEY_LEFT = 37;
document.addEventListener('keydown', function (e) {
  var isCodeMirrorFocused = $('.CodeMirror-focused').length > 0;
  if (isCodeMirrorFocused) {
    return;
  }

  if (document.activeElement instanceof HTMLInputElement) {
    // An input field is focused. Do not intercept arrow keys.
    return;
  }

  var nextHref = null;
  switch (e.keyCode) {
    case 39:
      // KEY_RIGHT
      nextHref = $("[data-action='go-next']").attr('href');
      break;
    case 37:
      // KEY_LEFT
      nextHref = $("[data-action='go-prev']").attr('href');
      break;
  }
  nextHref && (window.location.href = nextHref);
});

// Add target = _blank to all external links.
var links = document.links;
for (var i = 0, linksLength = links.length; i < linksLength; i++) {
  if (links[i].hostname != window.location.hostname) {
    links[i].target = '_blank';
  }
}

$('.topic.active').closest('.topics').addClass('open');
