$(document).ready(function() {
  $(document).on('click', 'a[data-action="toggle-expandable"]', function(e) {
    e.preventDefault();
    var $toggle = $(this);
    var $expandable = $(this).closest('.expandable');

    $expandable.toggleClass('expanded');
    $(body).toggleClass('noscroll');

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

  $(document).on('click', 'body', function (e) {
    // Collapse sidebar if open
    var $sidebar = $('#sidebar');
    if (!$sidebar.hasClass('hidden')) {
      $('#sidebar').addClass('hidden');
    }
  });

  $(document).on('click', '#sidebar', function (e) {
    e.stopPropagation();
  });

  var KEY_RIGHT = 39;
  var KEY_LEFT = 37;
  document.addEventListener('keydown', function (e) {
    var isCodeMirrorFocused = $('.CodeMirror-focused').length > 0;
    if (isCodeMirrorFocused) {
      return;
    }

    var keyCode = e.keyCode;
    if (keyCode === KEY_RIGHT) {
      var nextHref = $("[data-action='go-next']").attr('href');
      window.location.href = nextHref;
    } else if (keyCode === KEY_LEFT) {
      var prefHref = $("[data-action='go-prev']").attr('href');
      window.location.href = prefHref;
    }
  });

  // Add target = _blank to all external links.
  var links = document.links;
  for (var i = 0, linksLength = links.length; i < linksLength; i++) {
    if (links[i].hostname != window.location.hostname) {
      links[i].target = '_blank';
    }
  }
});
