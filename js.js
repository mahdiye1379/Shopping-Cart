const cartBtn = document.querySelector(".cart-btn");
const cartModal = document.querySelector(".cart");
const backDrop = document.querySelector(".backdrop");
const closeModal = document.querySelector(".cart-item-confirm");
const productsDom = document.querySelector(".products-center");
const cartTotal = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const clearCart = document.querySelector(".clear-cart");

import { productsData } from "./products.js";

let cart = [];

// 1. get data

class Products {
  // get from api end point!
  getproduct() {
    return productsData;
  }
}

let btnsDOM = [];
// 2. Display
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((item) => {
      result += `<div class="product">
          <div class="img-container">
            <img src=${item.imageUrl} class="product-img" />
          </div>
          <div class="product-desc">
            <p class="product-price">$ ${item.price}</p>
            <p class="product-title">${item.title}</p>
          </div>
          <button class="btn add-to-cart" data-id = "${item.id}">
            add to cart
          </button>
        </div>`;
      productsDom.innerHTML = result;
    });
  }

  getAddToCartBtns() {
    const addToCartBtn = [...document.querySelectorAll(".add-to-cart")];
    btnsDOM = addToCartBtn;

    addToCartBtn.forEach((btn) => {
      const id = btn.dataset.id;
      // check if this product id is in cart or not!
      const isInCart = cart.find((p) => p.id === parseInt(id));
      if (isInCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      } else {
        btn.addEventListener("click", (event) => {
          event.target.innerText = "In Cart";
          event.target.disabled = true;
          // get product from products
          const addedProduct = { ...Storage.getProduct(id), quantity: 1 };
          // add to cart
          cart = [...cart, addedProduct];
          // save cart to locaL Storage
          Storage.saveCart(cart);
          // update cart value
          this.setCartValue(cart);
          // add to cart item
          this.addCartItem(addedProduct);
          // get Cart From Storage
        });
      }
    });
  }

  setCartValue(cart) {
    // 1. cart items:
    // 2. cart total price :
    let tempCartItems = 0;
    const totalPrice = cart.reduce((acc, curr) => {
      tempCartItems += curr.quantity; //2 + 1 = 3
      return acc + curr.quantity * curr.price;
    }, 0);
    cartTotal.innerText = `Total Price : ${totalPrice.toFixed(2)} $`;
    cartItems.innerText = tempCartItems;
  }

  addCartItem(cartItems) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = ` <img class="cart-item-img" src=${cartItems.imageUrl} />
            <div class="cart-item-desc">
              <h4>${cartItems.title}</h4>
              <h5>$ ${cartItems.price}</h5>
            </div>
            <div class="cart-item-conteoller">
              <i class="fas fa-chevron-up" data-id=${cartItems.id} ></i>
              <p>${cartItems.quantity}</p>
              <i class="fas fa-chevron-down" data-id=${cartItems.id}></i>
            </div>
             <i class="far fa-trash-alt" data-id=${cartItems.id}></i>`;
    cartContent.appendChild(div);
  }

  setupApp() {
    // get cart from storage :
    cart = Storage.getCart();
    // add addCartItem
    cart.forEach((cartItem) => this.addCartItem(cartItem));
    // setvalues : price + item
    this.setCartValue(cart);
  }

  cartLogic() {
    // clear cart
    clearCart.addEventListener("click", () => this.clearCart());

    // cart functionality
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("fa-chevron-up")) {
        // console.log(event.target.dataset.id);

        const addQuantity = event.target;
        // get item from cart
        const addedItem = cart.find(
          (cItem) => cItem.id == addQuantity.dataset.id
        );
        // console.log(addQuantity.dataset.id);
        addedItem.quantity++;
        // save cart
        this.setCartValue(cart);
        // update cart vslue
        Storage.saveCart(cart);
        //  Update cart item in ui
        addQuantity.nextElementSibling.innerText = addedItem.quantity;
      } else if (event.target.classList.contains("fa-trash-alt")) {
        const removeItem = event.target;
        const _removedItem = cart.find((c) => c.id == removeItem.dataset.id);

        this.removeItem(_removedItem.id);
        Storage.saveCart(cart);
        cartContent.removeChild(removeItem.parentElement);
        // remove from cart item
        // remove
      } else if (event.target.classList.contains("fa-chevron-down")) {
        const subQuantity = event.target;
        const subStractedItem = cart.find(
          (c) => c.id == subQuantity.dataset.id
        );

        if (subStractedItem.quantity === 1) {
          this.removeItem(subStractedItem.id);
          cartContent.removeChild(subQuantity.parentElement.parentElement);
          return;
        }
        subStractedItem.quantity--;

        this.setCartValue(cart);
        // update cart vslue
        Storage.saveCart(cart);
        //  Update cart item in ui
        subQuantity.previousElementSibling.innerText = subStractedItem.quantity;
      }
    });
  }

  clearCart() {
    // remove: (Dry) =>
    cart.forEach((cItem) => this.removeItem(cItem.id));
    // remove cart content children
    while (cartContent.children.length) {
      cartContent.removeChild(cartContent.children[0]);
    }
    closeModalFunction();
  }

  removeItem(id) {
    //  update cart
    cart = cart.filter((cItem) => cItem.id !== id);
    // total valus and total price
    this.setCartValue(cart);
    // update storage
    Storage.saveCart(cart);

    // get add to cart btns => update text and disabled
    this.getSingleButton(id);
  }

  getSingleButton(id) {
    const button = btnsDOM.find(
      (btn) => parseInt(btn.dataset.id) === parseInt(id)
    );
    button.innerText = "add to cart";
    btnsDOM.disabled = false;
  }
}

// 3. Storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => p.id === parseInt(id));
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return JSON.parse(localStorage.getItem("cart"))
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const product = new Products();
  const productsData = product.getproduct();
  // set up : get cart and set up app:
  const ui = new UI();
  ui.setupApp();
  ui.displayProducts(productsData);
  ui.getAddToCartBtns();
  ui.cartLogic();
  Storage.saveProducts(productsData);
});

// /////////////
function showModalFunction() {
  backDrop.style.display = "block";
  cartModal.style.opacity = "1";
  cartModal.style.top = "20%";
}

function closeModalFunction() {
  backDrop.style.display = "none";
  cartModal.style.opacity = "0";
  cartModal.style.top = "-100%";
}

cartBtn.addEventListener("click", showModalFunction);
backDrop.addEventListener("click", closeModalFunction);
closeModal.addEventListener("click", closeModalFunction);
