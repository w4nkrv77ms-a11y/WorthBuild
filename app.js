document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("ideaForm");
  var result = document.getElementById("formResult");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var idea = form.querySelector('input[type="text"]').value.trim();
      var inputs = form.querySelectorAll("input");
      var country = inputs[1].value.trim();
      var city = inputs[2].value.trim();

      if (!idea || !country || !city) return;

      result.hidden = false;
      result.textContent = "Demo analysis ready for " + idea + " in " + city + ", " + country + ". This prototype does not yet use verified live market data.";
      result.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function () {
      var target = document.querySelector(link.getAttribute("href"));
      if (target) {
        setTimeout(function () {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
      }
    });
  });
});
