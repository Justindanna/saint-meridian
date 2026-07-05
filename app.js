const products = [
  { id: 'white-hoodie', name: 'Saint Meridian Hoodie - White', price: 100, image: '/public/images/white-hoodie.png', description: 'White hoodie with the Saint Meridian mark. Sizes S through XXL.' },
  { id: 'black-hoodie', name: 'Saint Meridian Hoodie - Black', price: 100, image: '/public/images/black-hoodie.png', description: 'Black hoodie with the Saint Meridian mark. Sizes S through XXL.' },
  { id: 'white-tee', name: 'Saint Meridian T-Shirt - White', price: 75, image: '/public/images/white-tee.png', description: 'White Saint Meridian T-shirt. Sizes S through XXL.' },
  { id: 'black-tee', name: 'Saint Meridian T-Shirt - Black', price: 75, image: '/public/images/black-tee.png', description: 'Black Saint Meridian T-shirt. Sizes S through XXL.' }
];

const cart = [];
const grid = document.getElementById('products');
const cartItems = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const total = document.getElementById('total');
const checkout = document.getElementById('checkout');

function renderProducts(){
  grid.innerHTML = products.map(p => `
    <article class="card">
      <div class="imageWrap"><img src="${p.image}" alt="${p.name}" loading="eager"></div>
      <div class="swatches"><span></span><span></span><span></span></div>
      <div class="cardRow"><h3>${p.name}</h3><div class="price">$${p.price}</div></div>
      <p class="desc">${p.description}</p>
      <div class="buy"><select id="size-${p.id}"><option>S</option><option selected>M</option><option>L</option><option>XL</option><option>XXL</option></select><button onclick="addToCart('${p.id}')">Add to cart</button></div>
    </article>`).join('');
}

function addToCart(id){
  const product = products.find(p => p.id === id);
  const size = document.getElementById(`size-${id}`).value;
  const existing = cart.find(i => i.id === id && i.size === size);
  if(existing) existing.qty += 1; else cart.push({ id, size, qty: 1 });
  renderCart();
  document.getElementById('cart').scrollIntoView({behavior:'smooth'});
}

function renderCart(){
  cartEmpty.style.display = cart.length ? 'none' : 'block';
  cartItems.innerHTML = cart.map(item => {
    const p = products.find(x => x.id === item.id);
    return `<div class="cartItem"><span>${p.name} / ${item.size} × ${item.qty}</span><strong>$${p.price * item.qty}</strong></div>`;
  }).join('');
  const sum = cart.reduce((acc,item)=> acc + products.find(p=>p.id===item.id).price * item.qty, 0);
  total.textContent = `$${sum}`;
  checkout.disabled = cart.length === 0;
}

checkout.addEventListener('click', async () => {
  checkout.disabled = true;
  checkout.textContent = 'Opening checkout...';
  try {
    const response = await fetch('/api/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({cart}) });
    const data = await response.json();
    if(!response.ok || !data.url) throw new Error(data.error || 'Checkout could not start.');
    window.location.href = data.url;
  } catch (err) {
    alert(err.message + ' Check Vercel Environment Variables for STRIPE_SECRET_KEY.');
    checkout.disabled = false;
    checkout.textContent = 'Checkout';
  }
});

const chat = document.getElementById('chat');
document.getElementById('chatBubble').onclick = () => chat.classList.toggle('open');
document.getElementById('closeChat').onclick = () => chat.classList.remove('open');
document.getElementById('chatForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if(!text) return;
  addMessage(text, 'user');
  input.value = '';
  setTimeout(() => addMessage(answer(text), 'bot'), 250);
});
function addMessage(text, type){
  const div = document.createElement('div');
  div.className = type;
  div.textContent = text;
  document.getElementById('chatBody').appendChild(div);
  div.scrollIntoView({behavior:'smooth', block:'end'});
}
function answer(text){
  const q = text.toLowerCase();
  if(q.includes('size') || q.includes('small') || q.includes('medium') || q.includes('large') || q.includes('xl')) return 'Our available sizes are S, M, L, XL, and XXL. Select your preferred size before adding an item to your cart.';
  if(q.includes('order') || q.includes('number') || q.includes('tracking')) return 'For order help, please have your order number ready. After purchase, your order number should be included in your confirmation email.';
  if(q.includes('ship') || q.includes('delivery') || q.includes('time') || q.includes('arrive')) return 'Standard order timing is 3–5 business days. You will receive updates using the contact information provided at checkout.';
  if(q.includes('return') || q.includes('exchange')) return 'For returns or exchanges, please include your order number and the item/size you purchased so support can review it professionally.';
  if(q.includes('checkout') || q.includes('pay') || q.includes('payment')) return 'Checkout is handled securely. No checkout API keys are displayed anywhere on the website.';
  return 'Thank you for reaching out to Saint Meridian. I can help with order numbers, sizes, 3–5 business day order timing, checkout, returns, and product details.';
}
renderProducts(); renderCart();
