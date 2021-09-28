const cartItems = '.cart__items';

function attTotalPrice(value) {
  const totalPriceSpan = document.querySelector('.total-price');
  localStorage.setItem('cartTotalPrice', JSON.stringify(value));
  totalPriceSpan.innerText = convertStringToBrl(value);
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

function convertStringToBrl(value) {
  return value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
}

async function createProductItemElement({ id: sku, title: name, price}, item) {
  const product = await getSingleProduct(sku);
  const imagemHD = product.pictures[0].url;
  item.classList = '';
  item.innerHTML = '';
  item.className = 'item';
  const sectionText = createCustomElement('div', 'item_content', '');
  item.appendChild(sectionText);
  sectionText.appendChild(createCustomElement('span', 'item__sku', sku));
  sectionText.appendChild(createProductImageElement(imagemHD));
  sectionText.appendChild(createCustomElement('span', 'item__title', name));
  sectionText.appendChild(createCustomElement('div', 'item_price', `Por ${convertStringToBrl(price)}`));
  item.appendChild(createCustomElement('button', 'item__add', `Adicionar ao carrinho!`));
  return item;
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
function creatSkeletonAnimation() {
  const itemsSection = document.querySelector('.items');
  for(let i = 0; i < 50; i += 1){
    const divItem = document.createElement('div');
    divItem.classList.add('item-skeleton', 'skeleton');
    itemsSection.appendChild(divItem);

    const divImg = document.createElement('div');
    divImg.classList.add('img-cart-skeleton', 'skeleton');
    divItem.appendChild(divImg);

    for (let j = 0; j < 4; j += 1) {
      const divTxt = document.createElement('div');
      divTxt.classList.add('item-txt-skeleton', 'skeleton-text', 'skeleton');
      divItem.appendChild(divTxt);
    }
  }
} 
async function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

async function generateProductList(prodctName) {
  const itemsSections = document.querySelector('.items');
  const childs = itemsSections.childNodes;
  itemsSections.innerHTML = '';
  creatSkeletonAnimation();
  const productList = await getProductList(prodctName);
  const prodctListResults = productList.results;
  prodctListResults.forEach(async (product, index) => {
    const productItemElement = await createProductItemElement(product, childs[index]);
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
  const elementPriceText = elementInnerText.split('PREÇO: $')[1];
  const elementPriceValue = parseFloat(elementPriceText);
  removeItemPrice(elementPriceValue);
  element.remove();
  saveCart();
}

function createCartItemElement({ id: sku, title: name, price: salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `${name} | PREÇO: $${salePrice}`;
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

function creatSkeletonDivs() {

}


window.onload = async () => {
  generateProductList('desktop');
  creatBodyListeners();
  await getSavedCart();
};
