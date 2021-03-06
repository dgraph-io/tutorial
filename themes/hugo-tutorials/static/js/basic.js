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
  $("iframe.ratel.query").each(function () {
    let url = "https://play.dgraph.io/?latest";
    const address = localStorage.getItem("tourDgraphAddr");
    const slashApiKey = localStorage.getItem("slashAPIKey");
    const query = $(this).data("code");

    if (address || slashApiKey || query) {
      url += "#";
      if (address) url += `addr=${address}&`;
      if (slashApiKey) url += `slashApiKey=${slashApiKey}&`;
      if (query) url += `query=${encodeURIComponent(query)}`;
    }
    console.log(url);
    $(this).attr("src", url);
  });
  $("iframe.ratel.mutate").each(function () {
    let url = "https://play.dgraph.io/?latest";
    const address = localStorage.getItem("tourDgraphAddr");
    const slashApiKey = localStorage.getItem("slashAPIKey");
    if (address || slashApiKey) {
      url += "#";
      if (address) url += `addr=${address}&`;
      if (slashApiKey) url += `slashApiKey=${slashApiKey}&`;
    }
    console.log(url);
    $(this).attr("src", url);
  });
  $("a.routeIframe").each(function () {
    $(this).click((e) => {
      e.preventDefault();
      const location = $(this).data("location");
      $(".lesson__code iframe").each(function () {
        $(this).attr("src", location);
      });
    });
  });
  const lessonEl = document.querySelector(".lesson");
  const contentEl = document.querySelector(".lesson__content");
  const codeEl = document.querySelector(".lesson__code");
  const resizerEl = document.querySelector(".lesson__resizer");
  resizerEl.addEventListener("mousedown", mousedown);
  function mousedown(e) {
    e.preventDefault();
    $("iframe").css("pointer-events", "none");
    let prevX = e.clientX;
    window.addEventListener("mousemove", mousemove);
    window.addEventListener("mouseup", mouseup);

    function mousemove(e) {
      const lessonRect = lessonEl.getBoundingClientRect();
      const contentRect = contentEl.getBoundingClientRect();
      let contentWidth = contentRect.width - (prevX - e.clientX);
      if (lessonRect.width <= contentWidth + 5) contentWidth = -5;
      const codeWidth = lessonRect.width - contentWidth - 5;
      console.log(lessonRect.width - contentWidth);
      contentEl.style["max-width"] = contentWidth + "px";
      contentEl.style["min-width"] = contentWidth + "px";
      contentEl.style["width"] = contentWidth + "px";
      codeEl.style["width"] = codeWidth + "px";
      prevX = e.clientX;
    }
    function mouseup() {
      window.removeEventListener("mousemove", mousemove);
      window.removeEventListener("mouseup", mouseup);
      $("iframe").css("pointer-events", "auto");
    }
  }
});
