function updateClock() {
  var clockSpan = document.getElementById("live-clock");
  if (!clockSpan) return;
  var now = new Date();
  clockSpan.textContent = now.toLocaleString();
}

document.addEventListener("partialsLoaded", function () {
  var yearSpan = document.getElementById("copyright-year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  updateClock();
  setInterval(updateClock, 1000);
});
