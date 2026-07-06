'use client';

import { useState } from 'react';

const products = [
  { name: 'Saint Meridian Hoodie - Black', price: 80, description: 'Heavyweight black hoodie with the Saint Meridian mark.', image: '/products/hoodie-black.jpg', colors: ['#f7f5f0', '#111111', '#d7d3ca'] },
  { name: 'Saint Meridian Hoodie - White', price: 80, description: 'Heavyweight white hoodie with the Saint Meridian mark.', image: '/products/hoodie-white.jpg', colors: ['#f7f5f0', '#e4e0d7', '#ffffff'] },
  { name: 'Saint Meridian T-Shirt - Black', price: 50, description: 'Clean black premium T-shirt with Saint Meridian branding.', image: '/products/tee-black.jpg', colors: ['#f7f5f0', '#d7d3ca', '#111111'] },
  { name: 'Saint Meridian T-Shirt - White', price: 50, description: 'Clean white premium T-shirt with Saint Meridian branding.', image: '/products/tee-white.jpg', colors: ['#f7f5f0', '#e4e0d7', '#ffffff'] }
];

export default function Home() {
  const [cart, setCart] = useState([]);
  const [sizeByProduct, setSizeByProduct] = useState({});
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportInput, setSupportInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi. Welcome to Saint Meridian support. How can we help you today?' }
  ]);

  const addToCart = (product) => {
    const size = sizeByProduct[product.name] || 'M';
    setCart((current) => [...current, { ...product, size }]);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const reply = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('size') || lower.includes('fit')) return 'For a regular fit, choose your normal size. For an oversized streetwear fit, size up once.';
    if (lower.includes('order') || lower.includes('tracking')) return 'For order help, send your order number and checkout email so support can check the status.';
    if (lower.includes('delivery') || lower.includes('shipping')) return 'Delivery timing depends on fulfillment and carrier updates. Use your confirmation email for the latest tracking details.';
    if (lower.includes('return') || lower.includes('exchange') || lower.includes('refund')) return 'For returns or exchanges, include your order number, item name, and reason for the request.';
    return 'Thanks. Please include any order number, product name, size, or checkout email if this is about an order.';
  };

  const sendMessage = (quickText) => {
    const text = (quickText || supportInput).trim();
    if (!text) return;
    setMessages((current) => [...current, { role: 'user', text }, { role: 'assistant', text: reply(text) }]);
    setSupportInput('');
  };

  const checkout = async () => {
    if (cart.length === 0) return;
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart })
      });
      const data = await response.json();
      if (data?.url) window.location.href = data.url;
      else alert('Checkout could not start. Please try again.');
    } catch {
      alert('Checkout could not start. Please try again.');
    }
  };

  return (
    <main>
      <header className="nav">
        <div className="brand">SAINT MERIDIAN</div>
        <nav><a href="#shop">Shop</a><a href="#support">Support</a><a href="#cart">Checkout</a><span className="bagIcon">0</span></nav>
      </header>

      <section className="hero">
        <p className="eyebrow">LUXURY STREETWEAR</p>
        <h1>Polished essentials in<br />black and white.</h1>
        <p className="subhero">OFFICIAL DROP</p>
        <a className="heroButton" href="#shop">Shop collection</a>
      </section>

      <section className="collection" id="shop">
        <div className="sectionTop"><p className="eyebrow">COLLECTION</p><h2>Featured products</h2></div>
        <div className="grid">
          {products.map((product) => (
            <article className="card" key={product.name}>
              <div className="imageWrap"><img src={product.image} alt={product.name} /></div>
              <div className="swatches">{product.colors.map((color) => <span key={color} style={{ background: color }} />)}</div>
              <div className="productLine"><h3>{product.name}</h3><strong>${product.price}</strong></div>
              <p className="desc">{product.description}</p>
              <div className="buyRow">
                <select value={sizeByProduct[product.name] || 'M'} onChange={(e) => setSizeByProduct((c) => ({ ...c, [product.name]: e.target.value }))}>
                  <option>S</option><option>M</option><option>L</option><option>XL</option><option>XXL</option>
                </select>
                <button onClick={() => addToCart(product)}>Add to cart</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cartSection" id="cart">
        <div><p className="eyebrow">SECURE CHECKOUT</p><h2>Your cart</h2><p>{cart.length === 0 ? 'Your cart is currently empty.' : `${cart.length} item(s) ready for checkout.`}</p></div>
        <div className="cartBox"><div className="cartTotal"><span>Total</span><strong>${total}</strong></div><button className="checkoutButton" disabled={cart.length === 0} onClick={checkout}>Checkout</button></div>
      </section>

      <section className="supportSection" id="support"><p className="eyebrow">CUSTOMER SERVICE</p><h2>Professional support, built in.</h2><p>Ask about sizes, order numbers, delivery timing, checkout, returns, and product details.</p></section>

      <button className="supportPill" onClick={() => setSupportOpen(true)} aria-label="Open customer support"><span className="onlineDot"></span><span><strong>Customer Support</strong><small>Online</small></span></button>

      {supportOpen && (
        <aside className="chatPanel" aria-label="Customer support chat">
          <div className="chatHeader"><div className="chatTitle"><span className="onlineDot"></span><div><strong>Customer Support</strong><small>Online</small></div></div><button onClick={() => setSupportOpen(false)}>—</button></div>
          <div className="chatBody">
            {messages.map((m, i) => <div className={`chatBubble ${m.role}`} key={i}>{m.text}</div>)}
            <div className="quickActions">
              <button onClick={() => sendMessage('What size should I order?')}>What size should I order?</button>
              <button onClick={() => sendMessage('Order status / tracking')}>Order status / tracking</button>
              <button onClick={() => sendMessage('Delivery time')}>Delivery time</button>
              <button onClick={() => sendMessage('Returns & exchanges')}>Returns & exchanges</button>
              <button onClick={() => sendMessage('Other question')}>Other question</button>
            </div>
          </div>
          <div className="chatInput"><input value={supportInput} onChange={(e) => setSupportInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }} placeholder="Type your message..." /><button onClick={() => sendMessage()}>➜</button></div>
          <p className="chatNote">We typically reply in a few minutes.</p>
        </aside>
      )}

      <footer><span>© 2026 Saint Meridian. All rights reserved.</span><div className="footerLinks"><a>Privacy Policy</a><a>Terms of Service</a><a>Shipping Policy</a><a>Refund Policy</a></div><div className="socials">◎ ♪ ▶</div></footer>
    </main>
  );
}
