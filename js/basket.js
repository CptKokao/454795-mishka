var basketImage = document.querySelectorAll(".catalog__basket-image");
var cartPopup = document.querySelector(".cart-popup");

if (basketImage.length > 0) {
  for (var i = 0; i < basketImage.length; i++) {
    basketImage[i].addEventListener("click", function(evt) {
      evt.preventDefault();
      cartPopup.classList.toggle("visually-hidden");
    });
  }
}
