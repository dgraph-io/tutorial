// vanilla javascript that does not need compiling
function updateSavedInput(key) {
  sessionStorage.setItem(key, $(`#${key}_id`).val());
}

function updateFields() {
  $('.sessionInput').each(function (i) {
    $(this).val(sessionStorage.getItem($(this).data('key')))
  });
  $('.sessionDisplayVal').each(function (i) {
    $(this).text(sessionStorage.getItem($(this).data('key')))
  });
}

$(document).ready(function () {
  updateFields();
});

$(document).on('click', '.runnable a.btn-change', async function (e) {
  e.preventDefault();
  $('.runnable-url-modal.modal').addClass('show');
});

$(document).on('click', '.runnable-url-modal button[data-dismiss="modal"]', async function (e) {
  $('.runnable-url-modal.modal').removeClass('show');
});

$(document).on('click', '.runnable-response-modal button[data-dismiss="modal"]', async function (e) {
  $('.runnable-response-modal.modal').removeClass('show');
});

$(document).on('click', '.runnable-url-modal button[data-action=apply-endpoint]', function (e) {
  sessionStorage.setItem('graphqlendpoint', $('#inputGraphQLEndpoint').val());
  sessionStorage.setItem('apikey', $('#inputAPIKey').val());
  $('.runnable-url-modal.modal').removeClass('show');
  updateFields();
});

$(document).ready(function () {
  if ($('.lesson__prev').is(':empty')) {
    $('.lesson__next').css({
      "transform": "translate(40px , 0)"
    })
  } else {
    $('.lesson__next').css({
      "transform": "translate(60px , 0)"
    })
  }
});