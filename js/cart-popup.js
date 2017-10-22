var productLink = document.querySelector(".product__link ");
var cartPopup = document.querySelector(".cart-popup");

productLink.addEventListener("click", function (evt) {
	evt.preventDefault();
    cartPopup.classList.toggle("visually-hidden");
});
