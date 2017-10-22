var navToggle = document.querySelector(".main-nav__toggle");
var navPopup = document.querySelector(".main-nav__popup");

navToggle.addEventListener("click", function (evt) {
evt.preventDefault();
    navPopup.classList.toggle("visually-hidden");
});
