document.addEventListener("DOMContentLoaded", function () {

  // Smooth scrolling for real in-page links only
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {

    link.addEventListener("click", function (event) {

      const targetId = this.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (target) {
        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }

    });

  });


  // Keep external/page navigation normal
  document.querySelectorAll('a[href$=".html"]').forEach(function (link) {

    link.addEventListener("click", function () {
      const href = this.getAttribute("href");

      if (href) {
        window.location.href = href;
      }
    });

  });


  // Prevent accidental form submission on demo forms
  document.querySelectorAll("form").forEach(function (form) {

    if (!form.getAttribute("onsubmit")) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
      });
    }

  });

});
