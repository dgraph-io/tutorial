import $ from "jquery";

$('#tour-release').change(function(e) {
  var dest = e.target.value;
  if (dest == DgTour.thisRelease) {
    return
  }
  if (dest == DgTour.latestRelease) {
    window.location.href = DgTour.home;
    return
  }
  if (dest != "master") {
    dest = "dgraph-" + dest
  }
  window.location.href = DgTour.home + dest;
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


    $(window).scroll(function () {
      if ($(window).scrollTop() > 50) {
        $("#page-header").addClass("bg-white");
      }
      else {
        $("#page-header").removeClass("bg-white");
      }
    });
    $(document).ready(function () {

      $('.nav-icon').click(function () {
        $('.page-nav').toggleClass('shownav');
        $(this).toggleClass('active');
      });
      var $nav = document.querySelector('.page-nav > ul');
      var $navItems = document.querySelectorAll('.page-nav > ul > li');
      var $navItemHeading = document.querySelectorAll('.page-nav > ul > li > div');
      var $subnav = document.querySelectorAll('.page-nav > ul > li > ul');
      $($navItemHeading).click(function (e) {
        $($navItems).removeClass('active');
        $(this).parent().toggleClass('active');
      });
      $('.nav-icon[target="_blank"]').removeAttr('target');
      var selectedValue = $('.page-select.dropdown .page-subnav__label.is-active').text();
      $(".page-select.dropdown button span").replaceWith(selectedValue);

    });

    $('select').each(function(){
      var $this = $(this), numberOfOptions = $(this).children('option').length;
    
      $this.addClass('select-hidden'); 
      $this.wrap('<div class="select"></div>');
      $this.after('<div class="select-styled"></div>');
  
      var $styledSelect = $this.next('div.select-styled');
      $styledSelect.text($this.children('option').eq(0).text());
    
      var $list = $('<ul />', {
          'class': 'select-options'
      }).insertAfter($styledSelect);
    
      for (var i = 0; i < numberOfOptions; i++) {
          $('<li />', {
              text: $this.children('option').eq(i).text(),
              rel: $this.children('option').eq(i).val()
          }).appendTo($list);
      }
    
      var $listItems = $list.children('li');
    
      $styledSelect.click(function(e) {
          e.stopPropagation();
          $('div.select-styled.active').not(this).each(function(){
              $(this).removeClass('active').next('ul.select-options').hide();
          });
          $(this).toggleClass('active').next('ul.select-options').toggle();
      });
    
      $listItems.click(function(e) {
          e.stopPropagation();
          $styledSelect.text($(this).text()).removeClass('active');
          $this.val($(this).attr('rel'));
          $list.hide();
          //console.log($this.val());
      });
      $('.select-options li').click(function(e) {
        $('.select-options li').removeClass('selected');

        $(this).addClass('selected');
      });
    
      $(document).click(function() {
          $styledSelect.removeClass('active');
          $list.hide();
      });
  
  });