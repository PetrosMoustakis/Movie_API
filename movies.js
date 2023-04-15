$(document).ready(function () {
  let debounceTimeout = null;
  $("#searchInput").on("input", function () {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => getMovie(this.value.trim()), 1500);
  });

  $("#showMore").on("click", function (e) {
    e.preventDefault();
    onShowMoreClicked();
  });
});

function getMovie(title) {
  if (!title) {
    return;
  }
  console.log(title);
  onBeforeSend();
  fetchMovieFromApi(title);
}

function fetchMovieFromApi(title) {
  let ajaxRequest = new XMLHttpRequest();
  ajaxRequest.open("GET", API_KEY, true);
  ajaxRequest.timeout = 5000; //timeout after 5 secs
  ajaxRequest.ontimeout = (e) => onApiError();
  ajaxRequest.onreadystatechange = function () {
    if (ajaxRequest.readyState === 4) {
      if (ajaxRequest.status === 200) {
        handleResults(JSON.parse(ajaxRequest.responseText));
      } else {
        onApiError();
      }
    }
  };
  ajaxRequest.send();
}

// Determines if the API found a movie or Notification.
// If the movie is found, the API response is transformed and then shown.
// Otherwise, show a not found error.

function handleResults(response) {
  console.log("check");
  if (response.Response === "True") {
    let transformed = transformResponse(response);
    buildMovie(transformed);
    console.log("check1");
  } else {
    hideComponent("#waiting");
    showNotFound();
    console.log("chec2k");
  }
}

function buildMovie(apiResponse) {
  if (apiResponse.poster) {
    $("#image")
      .attr("src", apiResponse.poster)
      .on("load", function () {
        buildMovieMetaData(apiResponse, $(this));
      });
  } else {
    buildMovieMetaData(apiResponse);
  }
}

function onBeforeSend() {
  showComponent("#waiting");
  hideComponent(".movie");
  hideNotFound();
  hideError();
  collapsePlot();
  hideExtras();
}

function onApiError() {
  hideComponent("#waiting");
  showError();
}

function buildMovieMetaData(apiResponse, imageTag) {
  hideComponent("#waiting");
  handleImage(imageTag);
  handleLiterals(apiResponse);
  showComponent(".movie");
}

function handleImage(imageTag) {
  imageTag ? $("#image").replaceWith(imageTag) : $("#image").removeAttr("src");
}

function handleLiterals(apiResponse) {
  $(".movie")
    .find("[id]")
    .each((index, item) => {
      if ($(item).is("a")) {
        $(item).attr("href", apiResponse[item.id]);
      } else {
        let valueElement = $(item).children("span");
        let metadataValue = apiResponse[item.id] ? apiResponse[item.id] : "-";
        valueElement.length
          ? valueElement.text(metadataValue)
          : $(item).text(metadataValue);
      }
    });
}

function transformResponse(apiResponse) {
  let camelCaseKeysResponse = camelCaseKeys(apiResponse);
  clearNotAvailableInformation(camelCaseKeysResponse);
  buildImdbLink(camelCaseKeysResponse);
  return camelCaseKeysResponse;
}

function camelCaseKeys(apiResponse) {
  return _.mapKeys(apiResponse, (v, k) => _.camelCase(k));
}

function buildImdbLink(apiResponse) {
  if (apiResponse.imdbId && apiResponse.imdbId !== "N/A") {
    apiResponse.imdbId = `https://www.imdb.com/title/${apiResponse.imdbId}`;
  }
}

function clearNotAvailableInformation(apiResponse) {
  for (var key in apiResponse) {
    if (apiResponse.hasOwnProperty(key) && apiResponse[key] === "N/A") {
      apiResponse[key] = "";
    }
  }
}

function onShowMoreClicked() {
  $("#plot").toggleClass("expanded");
  if ($(".extended").is(":visible")) {
    $(".extended").hide(700);
  } else {
    $(".extended").show(700);
  }
}

function hideComponent(jquerySelector) {
  return $(jquerySelector).addClass("hidden");
}

function showComponent(jquerySelector) {
  return $(jquerySelector).removeClass("hidden");
}

function showNotFound() {
  $(".not-found").clone().removeClass("hidden").appendTo($(".center"));
}

function hideNotFound() {
  $(".center").find(".not-found").remove();
}

function showError() {
  $(".error").clone().removeClass("hidden").appendTo($(".center"));
}

function hideError() {
  $(".center").find(".error").remove();
}

function hideExtras() {
  $(".extended").hide();
}

function collapsePlot() {
  $("#plot").removeClass("expanded");
}
