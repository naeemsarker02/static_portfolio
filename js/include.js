function loadPartial(placeholderId, filePath) {
  return fetch(filePath)
    .then(function (response) {
      return response.text();
    })
    .then(function (html) {
      document.getElementById(placeholderId).innerHTML = html;
    });
}

Promise.all([
  loadPartial("header-placeholder", "partials/header.html"),
  loadPartial("footer-placeholder", "partials/footer.html")
]).then(function () {
  document.dispatchEvent(new Event("partialsLoaded"));
});
