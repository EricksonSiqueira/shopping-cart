const cartItems = '.cart__items';

function attTotalPrice(value) {
  const totalPriceSpan = document.querySelector('.total-price');
  localStorage.setItem('cartTotalPrice', JSON.stringify(value));
  totalPriceSpan.innerText = value;
}

function removeItemPrice(value) {
  const localValue = JSON.parse(localStorage.getItem('cartTotalPrice'));
  const localValueOperation = localValue - value;
  const newLocalValueText = localValueOperation === 0 ? 0 : localValueOperation.toFixed(2);
  const newLocalValue = parseFloat(newLocalValueText);
  attTotalPrice(newLocalValue);
}

function addItemPrice(value) {
  const localValue = JSON.parse(localStorage.getItem('cartTotalPrice'));
  const newLocalValue = localValue + value;
  attTotalPrice(newLocalValue);
}

function getSavedCartValue() {
  if (localStorage.cartTotalPrice) {
    const cartSavedValue = JSON.parse(localStorage.getItem('cartTotalPrice'));
    attTotalPrice(cartSavedValue);
  } else {
    localStorage.setItem('cartTotalPrice', 0);
  }
}

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ id: sku, title: name, thumbnail: image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));
  
  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

async function getProductList(productName) {
  const API_URL = `https://api.mercadolibre.com/sites/MLB/search?q=${productName}`;
  const productListPromise = await fetch(API_URL);
  const productListConverted = await productListPromise.json();
  
  return productListConverted;
}

function generateLoadingScreen(elementToAppend, text) {
  const loadingP = document.createElement('p');
  loadingP.innerText = text;
  loadingP.classList.add('loading');
  elementToAppend.appendChild(loadingP);
}

async function generateProductList(prodctName) {
  const itemsSections = document.querySelector('.items');
  itemsSections.innerHTML = '';
  generateLoadingScreen(itemsSections, 'Carregando...');
  const productList = await getProductList(prodctName);
  const prodctListResults = productList.results;
  itemsSections.innerHTML = '';
  prodctListResults.forEach((product) => {
    const productItemElement = createProductItemElement(product);
    itemsSections.appendChild(productItemElement);
  });
}

async function getSingleProduct(id) {
  const product = await fetch(`https://api.mercadolibre.com/items/${id}`);
  const productConverted = await product.json();
  
  return productConverted;
}
function getCartProductIdList() {
  const cartOl = document.querySelector(cartItems);
  const cartProductsLis = cartOl.querySelectorAll('li');
  const cartProductsIds = [];
  cartProductsLis.forEach((product) => {
    cartProductsIds.push(product.innerHTML);
  });
  return cartProductsIds;
}

async function saveCart() {
  const cartProductsIdsList = getCartProductIdList();
  localStorage.setItem('cartProductsIds', JSON.stringify(cartProductsIdsList));
}

function cartItemClickListener(event) {
  // coloque seu código aqui
  const element = event.target;
  const elementInnerText = element.innerText;
  const elementPriceText = elementInnerText.split('PRICE: $')[1];
  const elementPriceValue = parseFloat(elementPriceText);
  removeItemPrice(elementPriceValue);
  element.remove();
  saveCart();
}

function createCartItemElement({ id: sku, title: name, price: salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}
async function addItemToCart(id) {
  const productPromise = await getSingleProduct(id);
  const cartItemsSection = document.querySelector(cartItems);
  addItemPrice(productPromise.price);
  const cartItemElement = createCartItemElement(productPromise);
  cartItemsSection.appendChild(cartItemElement);
}

function creatSavedLi(innerHtml) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = innerHtml;
  li.addEventListener('click', cartItemClickListener);
  return li;
}
function addSavedProductToCart(product) {
  const cartItemsSection = document.querySelector(cartItems);
  const cartSavedLi = creatSavedLi(product);
  cartItemsSection.appendChild(cartSavedLi);
}

function getSavedCart() {
  if (localStorage.cartProductsIds) {
    const savedCartProducts = JSON.parse(localStorage.getItem('cartProductsIds'));
    if (savedCartProducts.length > 0) {
      savedCartProducts.forEach((product) => addSavedProductToCart(product));
    }
  }
  getSavedCartValue();
}
function getInputSearchValue () {
  const searchInput = document.querySelector('#search-input');
  return searchInput.value;
}

function creatBodyListeners() {
  document.body.addEventListener('click', async (event) => {
    const element = event.target;
    if (element.classList.contains('item__add')) {
      const productElement = element.parentElement;
      const productId = getSkuFromProductItem(productElement);
      await addItemToCart(productId);
      saveCart();
    }
    if (element.classList.contains('empty-cart')) {
      const cartItmsOl = document.querySelector(cartItems);
      cartItmsOl.innerHTML = '';
      saveCart();
      attTotalPrice(0);
    }
    if (element.classList.contains('search-button')) {
      generateProductList(getInputSearchValue());
    }
  });
}

window.onload = async () => {
  generateProductList('computador');
  creatBodyListeners();
  await getSavedCart();
};
