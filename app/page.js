'use client';

import { useMemo, useState } from 'react';

const products = [
  { id: 'black-hoodie', name: 'Saint Meridian Hoodie - Black', price: 318, image: '/images/black-hoodie.png', description: 'Heavyweight black hoodie with the Saint Meridian mark.' },
  { id: 'white-hoodie', name: 'Saint Meridian Hoodie - White', price: 398, image: '/images/white-hoodie.png', description: 'Heavyweight white hoodie with the Saint Meridian mark.' },
  { id: 'black-tee', name: 'Saint Meridian T-Shirt - Black', price: 318, image: '/images/black-tee.png', description: 'Clean black premium T-shirt with Saint Meridian branding.' },
  { id: 'white-tee', name: 'Saint Meridian T-Shirt - White', price: 318, image: '/images/white-tee.png', description: 'Clean white premium T-shirt with Saint Meridian branding.' }
];

const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

export default function Home() {
  const [cart, setCart] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState(Object.fromEntries(products.map((p) => [p.id, 'M'])));
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'agent', text: 'Welcome to Saint Meridian support. I can help with order numbers, sizing, checkout, delivery timing, and returns.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart]);

  function addToCart(product) {
    const size = selectedSizes[product.id] || 'M';
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id && item.size === size);
      if (existing) return current.map((item) => item === existing ? { ...item, qty: item.qty + 1 } : item);
      return [...current, { ...product, size, qty: 1 }];
    });
  }

  async function checkout() {
    if (!cart.length) return;
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart })
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || 'Checkout could not be started.');
    } catch {
      alert('Checkout could not be started. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function answerSupport(text) {
    const q = text.toLowerCase();
    if (q.includes('size') || q.includes('small') || q.includes('medium') || q.includes('large') || q.includes('xl')) {
      return 'Our current sizes are S, M, L, XL, and XXL. If you prefer an oversized fit, choose one size up.';
    }
    if (q.includes('order') || q.includes('#')) {
      return 'I can help with order questions. Please include your order number and the email used at checkout so support can locate it.';
    }
    if (q.includes('ship') || q.includes('delivery') || q.includes('time') || q.includes('arrive')) {
      return 'Orders are estimated to arrive in 3–5 business days after processing.';
    }
    if (q.includes('return') || q.includes('exchange')) {
      return 'For returns or exchanges, please include your order number, item, size, and the reason for the request.';
    }
    if (q.includes('checkout') || q.includes('pay')) {
      return 'Checkout is handled securely. Add items to your cart, choose your size, then press Checkout.';
    }
    return 'Thanks for reaching out. I can help with sizes, order numbers, delivery timing, checkout, returns, and product questions.';
  }

  function sendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: 'customer', text }, { role: 'agent', text: answerSupport(text) }]);
    setInput('');
  }

  return (
    <main>
      <header className="nav">
        <div className="brand">SAINT MERIDIAN</div>
        <nav><a href="#shop">Shop</a><a href="#support">Support</a><a href="#cart">Checkout</a></nav>
      </header>

      <section className="hero">
        <p className="eyebrow">LUXURY STREETWEAR</p>
        <h1>Polished essentials in black and white.</h1>
        <p>Saint Meridian test drop featuring premium hoodies and T-shirts.</p>
        <a className="button" href="#shop">Shop collection</a>
      </section>

      <section id="shop" className="shop">
        <div className="sectionHead"><p className="eyebrow">COLLECTION</p><h2>Featured products</h2></div>
        <div className="grid">
          {products.map((product) => (
            <article className="card" key={product.id}>
              <div className="imageWrap"><img src={product.image} alt={product.name} /></div>
              <div className="swatches"><span></span><span></span><span></span></div>
              <div className="row"><h3>{product.name}</h3><strong>${product.price}</strong></div>
              <p>{product.description}</p>
              <div className="buyRow">
                <select value={selectedSizes[product.id]} onChange={(e) => setSelectedSizes({ ...selectedSizes, [product.id]: e.target.value })}>
                  {sizes.map((s) => <option key={s}>{s}</option>)}
                </select>
                <button onClick={() => addToCart(product)}>Add to cart</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="cart" className="cartSection">
        <div><p className="eyebrow">SECURE CHECKOUT</p><h2>Your cart</h2>{cart.length ? cart.map((item) => <p key={`${item.id}-${item.size}`}>{item.name} / {item.size} × {item.qty}</p>) : <p>Your cart is currently empty.</p>}</div>
        <div className="checkoutBox"><div className="row"><span>Total</span><strong>${total}</strong></div><button disabled={!cart.length || loading} onClick={checkout}>{loading ? 'Opening checkout...' : 'Checkout'}</button></div>
      </section>

      <section id="support" className="support"><p className="eyebrow">CUSTOMER SERVICE</p><h2>Professional support, built in.</h2><p>Ask about sizes, order numbers, delivery timing, checkout, returns, and product details.</p></section>

      <button className="chatButton" onClick={() => setChatOpen(true)}>Customer Support<br/><span>Chat with us</span></button>
      {chatOpen && <div className="chatPanel"><div className="chatTop"><strong>Saint Meridian Support</strong><button onClick={() => setChatOpen(false)}>×</button></div><div className="chatMessages">{messages.map((m, i) => <p key={i} className={m.role}>{m.text}</p>)}</div><form onSubmit={sendMessage}><input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about sizing or an order..."/><button>Send</button></form></div>}

      <footer>© 2026 Saint Meridian. All rights reserved.</footer>
    </main>
  );
}
