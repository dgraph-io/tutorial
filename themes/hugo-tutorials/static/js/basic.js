// vanilla javascript that does not need compiling
function updateSavedInput(key) {
  sessionStorage.setItem(key, $(`#${key}_id`).val());
}

function updateFields() {
  $(".sessionInput").each(function (i) {
    $(this).val(sessionStorage.getItem($(this).data("key")));
  });
  $(".sessionDisplayVal").each(function (i) {
    $(this).text(sessionStorage.getItem($(this).data("key")));
  });
}

$(document).ready(function () {
  updateFields();
  $(".lesson-tiles__link .status").each(function () {
    const status = localStorage.getItem(`${$(this).data("course")}.Status`);
    if (status === "1") $(this).addClass("completed");
  });
  $(".lesson[data-completed]").each(function () {
    localStorage.setItem(`${$(this).data("completed")}.Status`, "1");
  });
});

$(document).on("click", ".runnable a.btn-change", async function (e) {
  e.preventDefault();
  $(".runnable-url-modal.modal").addClass("show");
});

$(document).on(
  "click",
  '.runnable-url-modal button[data-dismiss="modal"]',
  async function (e) {
    $(".runnable-url-modal.modal").removeClass("show");
  }
);

$(document).on(
  "click",
  '.runnable-response-modal button[data-dismiss="modal"]',
  async function (e) {
    $(".runnable-response-modal.modal").removeClass("show");
  }
);

$(document).on(
  "click",
  ".runnable-url-modal button[data-action=apply-endpoint]",
  function (e) {
    sessionStorage.setItem("graphqlendpoint", $("#inputGraphQLEndpoint").val());
    sessionStorage.setItem("apikey", $("#inputAPIKey").val());
    $(".runnable-url-modal.modal").removeClass("show");
    updateFields();
  }
);

$(document).ready(function () {
  if ($(".lesson__prev").is(":empty")) {
    $(".lesson__next").css({
      transform: "translate(40px , 0)",
    });
  } else {
    $(".lesson__next").css({
      transform: "translate(60px , 0)",
    });
  }
});

$(document).on("click", ".lesson-tiles-switcher div", function (e) {
  console.log("switching...");
  console.log($(this).data("context"));
  console.log($(".lesson-tiles-container .container").data("context"));
  $(".lesson-tiles-container .container").attr(
    "data-context",
    $(this).data("context")
  );
  $(".lesson-tiles-container .container").data(
    "context",
    $(this).data("context")
  );
});

$(document).ready(function () {
  if ($(".lesson-tiles-switcher")[0]) {
    let searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has("graphql")) {
      $(".lesson-tiles-container .container").attr("data-context", "graphql");
      $(".lesson-tiles-container .container").data("context", "graphql");
    } else if (searchParams.has("dql")) {
      $(".lesson-tiles-container .container").attr("data-context", "dql");
      $(".lesson-tiles-container .container").data("context", "dql");
    }
  }
  const request = new XMLHttpRequest();
  request.open("GET", "https://api.github.com/repos/dgraph-io/dgraph", true);
  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      const data = JSON.parse(request.responseText);
      const stars = `${(data.stargazers_count / 1000).toFixed(1)}k`;
      $(".gh-button__stat__text").text(stars);
    }
  };
  request.send();
});
