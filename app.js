const products = [
  { id:'white-hoodie', name:'Saint Meridian Hoodie - White', price:100, image:'/public/images/white-hoodie.png', desc:'White heavyweight hoodie with Saint Meridian mark.' },
  { id:'black-hoodie', name:'Saint Meridian Hoodie - Black', price:100, image:'/public/images/black-hoodie.png', desc:'Black heavyweight hoodie with Saint Meridian mark.' },
  { id:'white-tee', name:'Saint Meridian T-Shirt White', price:75, image:'/public/images/white-tee.png', desc:'White premium box tee with Saint Meridian mark.' },
  { id:'black-tee', name:'Saint Meridian T-Shirt Black', price:75, image:'/public/images/black-tee.png', desc:'Black premium box tee with Saint Meridian mark.' }
];
const sizes = ['S','M','L','XL','XXL'];
let cart = [];
const grid = document.getElementById('productGrid');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartEmpty = document.getElementById('cartEmpty');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutMsg = document.getElementById('checkoutMsg');
function money(n){ return '$' + n.toFixed(0); }
function renderProducts(){
  grid.innerHTML = products.map(p => `
    <article class="card">
      <div class="imageWrap"><img src="${p.image}" alt="${p.name}" loading="eager"></div>
      <div class="swatches"><span></span><span></span><span></span></div>
      <div class="productTop"><h3>${p.name}</h3><span class="price">${money(p.price)}</span></div>
      <p class="desc">${p.desc}</p>
      <div class="buyRow">
        <select id="size-${p.id}">${sizes.map(s=>`<option>${s}</option>`).join('')}</select>
        <button onclick="addToCart('${p.id}')">Add to cart</button>
      </div>
    </article>`).join('');
}
function addToCart(id){
  const product = products.find(p=>p.id===id);
  const size = document.getElementById(`size-${id}`).value;
  const existing = cart.find(i=>i.id===id && i.size===size);
  if(existing) existing.quantity += 1; else cart.push({...product,size,quantity:1});
  renderCart();
  location.hash = '#cart';
}
function renderCart(){
  cartItems.innerHTML = cart.map(i=>`<div class="cartLine"><span>${i.name} / ${i.size} × ${i.quantity}</span><strong>${money(i.price*i.quantity)}</strong></div>`).join('');
  const total = cart.reduce((s,i)=>s+i.price*i.quantity,0);
  cartTotal.textContent = money(total);
  cartEmpty.style.display = cart.length ? 'none':'block';
  checkoutBtn.disabled = cart.length === 0;
}
checkoutBtn.addEventListener('click', async()=>{
  checkoutMsg.textContent = 'Opening secure checkout...';
  checkoutBtn.disabled = true;
  try{
    const res = await fetch('/api/checkout', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({items:cart})});
    const data = await res.json();
    if(data.url) window.location.href = data.url;
    else throw new Error(data.error || 'Checkout is not configured yet.');
  }catch(err){
    checkoutMsg.textContent = err.message || 'Checkout could not open. Check your Vercel environment variables.';
    checkoutBtn.disabled = false;
  }
});
const chatToggle = document.getElementById('chatToggle');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
function addMsg(text, who='bot'){
  const div = document.createElement('div');
  div.className = `msg ${who}`;
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
function reply(q){
  q = q.toLowerCase();
  if(q.includes('size')) return 'Saint Meridian sizes come in S, M, L, XL, and XXL. If you prefer a relaxed streetwear fit, consider sizing up.';
  if(q.includes('order') || q.includes('number') || q.includes('track')) return 'I can help with order questions. Please provide your order number and the email used at checkout so support can review it professionally.';
  if(q.includes('ship') || q.includes('delivery') || q.includes('time') || q.includes('long')) return 'Estimated order time is 3–5 business days after processing. You will receive updates through the email used at checkout.';
  if(q.includes('return') || q.includes('exchange')) return 'For returns or exchanges, please provide your order number and item details. Our support team will review it and respond politely.';
  if(q.includes('checkout') || q.includes('pay')) return 'Use the cart checkout button to open secure checkout. No checkout API keys are displayed anywhere on the website.';
  return 'Thank you for contacting Saint Meridian support. I can help with order numbers, shirt sizes, delivery timing, checkout, returns, and product questions.';
}
chatToggle.addEventListener('click',()=>{ chatPanel.classList.add('open'); chatPanel.setAttribute('aria-hidden','false'); if(!chatMessages.children.length) addMsg('Hello, thank you for contacting Saint Meridian. How may I help you today?'); });
chatClose.addEventListener('click',()=>{ chatPanel.classList.remove('open'); chatPanel.setAttribute('aria-hidden','true'); });
chatForm.addEventListener('submit',(e)=>{ e.preventDefault(); const val=chatInput.value.trim(); if(!val) return; addMsg(val,'user'); chatInput.value=''; setTimeout(()=>addMsg(reply(val),'bot'),250); });
renderProducts(); renderCart();
