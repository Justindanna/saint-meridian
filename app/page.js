'use client';

import { useMemo, useState } from 'react';

const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

const products = [
  {
    id: 'black-hoodie',
    name: 'Saint Meridian Hoodie — Black',
    price: 100,
    image: '/images/black-hoodie.png',
    type: 'Hoodie',
    description: 'A premium black hoodie with the Saint Meridian mark.'
  },
  {
    id: 'white-hoodie',
    name: 'Saint Meridian Hoodie — White',
    price: 100,
    image: '/images/white-hoodie.png',
    type: 'Hoodie',
    description: 'A clean white hoodie with a refined Saint Meridian front print.'
  },
  {
    id: 'black-tee',
    name: 'Saint Meridian T-Shirt — Black',
    price: 75,
    image: '/images/black-tee.png',
    type: 'T-Shirt',
    description: 'A black oversized tee made for a polished everyday fit.'
  },
  {
    id: 'white-tee',
    name: 'Saint Meridian T-Shirt — White',
    price: 75,
    image: '/images/white-tee.png',
    type: 'T-Shirt',
    description: 'A white oversized tee featuring the Saint Meridian logo.'
  }
];

function CustomerService() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'agent', text: 'Hello, welcome to Saint Meridian. How may I help you today?' }
  ]);
  const [input, setInput] = useState('');

  function answerCustomer(message) {
    const text = message.toLowerCase();
    if (text.includes('order') || text.includes('#')) {
      return 'I can help with order questions. Please send your order number, and our support team can review the status for you. Standard order times are 3–5 business days.';
    }
    if (text.includes('size') || text.includes('small') || text.includes('medium') || text.includes('large') || text.includes('xl')) {
      return 'Our available sizes are S, M, L, XL, and XXL. For a more relaxed fit, we recommend choosing one size up.';
    }
    if (text.includes('shipping') || text.includes('delivery') || text.includes('time') || text.includes('arrive')) {
      return 'Saint Meridian order times are typically 3–5 business days. Thank you for your patience while your order is prepared.';
    }
    if (text.includes('return') || text.includes('refund')) {
      return 'I can help with that. Please include your order number and the issue with your item so our support team can review it professionally.';
    }
    return 'Thank you for reaching out. I can assist with order numbers, sizing, and order timing. Sizes are S, M, L, XL, and XXL, and order times are typically 3–5 business days.';
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const customerMessage = input.trim();
    setMessages((prev) => [
      ...prev,
      { from: 'customer', text: customerMessage },
      { from: 'agent', text: answerCustomer(customerMessage) }
    ]);
    setInput('');
  }

  return (
    <>
      <button className="chatButton" onClick={() => setOpen(!open)}>
        Customer Service
      </button>
      {open && (
        <section className="chatPanel" aria-label="Saint Meridian customer service">
          <div className="chatHeader">
            <div>
              <strong>Saint Meridian Support</strong>
              <span>Professional customer care</span>
            </div>
            <button onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="chatBody">
            {messages.map((message, index) => (
              <p key={index} className={message.from === 'agent' ? 'agent' : 'customer'}>
                {message.text}
              </p>
            ))}
          </div>
          <form className="chatForm" onSubmit={sendMessage}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sizes, orders, or delivery"
            />
            <button type="submit">Send</button>
          </form>
        </section>
      )}
    </>
  );
}

function ProductCard({ product }) {
  const [size, setSize] = useState('M');
  const [loading, setLoading] = useState(false);

  async function checkout() {
    try {
      setLoading(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, size })
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      alert(data?.error || 'Checkout is not available yet. Please check your store settings.');
    } catch (error) {
      alert('Checkout could not start. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="productCard">
      <div className="imageWrap">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="productInfo">
        <span>{product.type}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="buyRow">
          <strong>${product.price}</strong>
          <select value={size} onChange={(e) => setSize(e.target.value)} aria-label="Select size">
            {sizes.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button className="checkout" onClick={checkout} disabled={loading}>
          {loading ? 'Starting checkout...' : 'Checkout'}
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const featured = useMemo(() => products, []);

  return (
    <main>
      <header className="nav">
        <div className="brand">SAINT MERIDIAN</div>
        <nav>
          <a href="#shop">Shop</a>
          <a href="#support">Support</a>
        </nav>
      </header>

      <section className="hero">
        <div className="heroText">
          <p className="eyebrow">TEST DROP</p>
          <h1>Minimal streetwear in black and white.</h1>
          <p className="heroCopy">Saint Meridian essentials built around a clean interface, premium presentation, and easy checkout.</p>
          <a className="heroButton" href="#shop">Shop the drop</a>
        </div>
        <div className="heroImage">
          <img src="/images/black-hoodie.png" alt="Saint Meridian black hoodie" />
        </div>
      </section>

      <section className="trustBar">
        <span>Sizes S–XXL</span>
        <span>3–5 business days</span>
        <span>Secure checkout</span>
      </section>

      <section id="shop" className="shop">
        <div className="sectionTitle">
          <p>SHOP</p>
          <h2>Saint Meridian essentials</h2>
        </div>
        <div className="grid">
          {featured.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section id="support" className="support">
        <h2>Need help?</h2>
        <p>Our customer service agent can help with order numbers, shirt sizes, and order timing. Available sizes are S, M, L, XL, and XXL. Standard order times are 3–5 business days.</p>
      </section>

      <footer>
        <strong>SAINT MERIDIAN</strong>
        <span>Black and white essentials.</span>
      </footer>

      <CustomerService />
    </main>
  );
}
