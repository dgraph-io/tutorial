$(document).ready(function() {
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
  })
});
