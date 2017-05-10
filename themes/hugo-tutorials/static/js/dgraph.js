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

    $('#sidebar').toggleClass('hidden');
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

  // Add target = _blank to all external links.
  var links = document.links;
  for (var i = 0, linksLength = links.length; i < linksLength; i++) {
    if (links[i].hostname != window.location.hostname) {
      links[i].target = '_blank';
    }
  }
});
