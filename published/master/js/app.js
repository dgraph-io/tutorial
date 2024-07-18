$(function () {
    // move the community widget to the right-side
    $('.community-cta-wrapper').css({ right: '3%', left: 'unset' });

    // Navigation modal go back button click event listener
    $('#go-back').on('click', function (e) {
        $('#dgraph-tour').css({ display: 'block' });
        $('#dgraph-tour-category').css({ display: 'none' });
    });

    $('#toggle-navigation-modal').on('click', function (e) {
        $(this).toggleClass('active');
        animateModal();
    });

    $('#toggle-navigation-modal.acive').on('click', function (e) {
        animateModal(600);
    });
});

function animateModal(timeout) {
    $('#page-navigation-modal').scrollTop(0);
    $('#page-navigation-modal').toggleClass('show');
    $('#lesson-content-inner').toggleClass('hide');
    $('#lesson-content').scrollTop(0);
    $('#lesson-content').toggleClass('over-flow-hidden');
    $('.lesson__code').toggleClass('active');
    setTimeout(() => $('.lesson__content').toggleClass('margin-0'), timeout || 0);
}
