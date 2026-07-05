'use client';

import { useState } from 'react';

const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

const products = [
  {
    id: 'black-hoodie',
    name: 'Saint Meridian Hoodie — Black',
    price: 100,
    image: '/images/black-hoodie.png',
    type: 'Hoodie',
    description: 'Premium black hoodie with the Saint Meridian mark.'
  },
  {
    id: 'white-hoodie',
    name: 'Saint Meridian Hoodie — White',
    price: 100,
    image: '/images/white-hoodie.png',
    type: 'Hoodie',
    description: 'Clean white hoodie with a refined Saint Meridian front print.'
  },
  {
    id: 'black-tee',
    name: 'Saint Meridian T-Shirt — Black',
    price: 75,
    image: '/images/black-tee.png',
    type: 'T-Shirt',
    description: 'Black oversized tee made for a polished everyday fit.'
  },
  {
    id: 'white-tee',
    name: 'Saint Meridian T-Shirt — White',
    price: 75,
    image: '/images/white-tee.png',
    type: 'T-Shirt',
    description: 'White oversized tee featuring the Saint Meridian logo.'
  }
];

function getSupportAnswer(value) {
  const text = value.toLowerCase();

  if (text.includes('order') || text.includes('number') || text.includes('#')) {
    return 'Of course. Please send your order number, and our support team can review it. Standard Saint Meridian order times are 3–5 business days.';
  }

  if (text.includes('size') || text.includes('s ') || text.includes('small') || text.includes('medium') || text.includes('large') || text.includes('xl') || text.includes('xxl')) {
    return 'Saint Meridian sizes are S, M, L, XL, and XXL. For a more relaxed fit, we recommend sizing up.';
  }

  if (text.includes('shipping') || text.includes('delivery') || text.includes('arrive') || text.includes('time') || text.includes('long')) {
    return 'Order times are typically 3–5 business days. We appreciate your patience while your item is prepared.';
  }

  if (text.includes('return') || text.includes('refund') || text.includes('exchange')) {
    return 'I can help with that. Please include your order number and a short description of the issue so our support team can review it professionally.';
  }

  return 'Thank you for contacting Saint Meridian. I can help with order numbers, sizing, and order timing. Sizes are S, M, L, XL, and XXL. Order times are 3–5 business days.';
}

function CustomerServiceAgent() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'agent', text: 'Hello, welcome to Saint Meridian Support. How may I help you today?' }
  ]);

  function sendMessage(event) {
    event.preventDefault();
    const clean = input.trim();
    if (!clean) return;

    setMessages((current) => [
      ...current,
      { from: 'customer', text: clean },
      { from: 'agent', text: getSupportAnswer(clean) }
    ]);
    setInput('');
  }

  return (
    <>
      <button type="button" className="chatButton" onClick={() => setOpen(true)}>
        Customer Service
      </button>

      {open ? (
        <div className="chatPanel" role="dialog" aria-label="Saint Meridian customer service chat">
          <div className="chatHeader">
            <div>
              <strong>Saint Meridian Support</strong>
              <span>Professional customer care</span>
            </div>
            <button type="button" aria-label="Close customer service" onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="chatBody">
            {messages.map((message, index) => (
              <p key={index} className={message.from === 'agent' ? 'agentMessage' : 'customerMessage'}>
                {message.text}
              </p>
            ))}
          </div>

          <form className="chatForm" onSubmit={sendMessage}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about orders, sizes, or delivery"
              aria-label="Customer service message"
            />
            <button type="submit">Send</button>
          </form>
        </div>
      ) : null}
    </>
  );
}

function ProductCard({ product }) {
  const [size, setSize] = useState('M');
  const [loading, setLoading] = useState(false);

  async function checkout() {
    try {
      setLoading(true);
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, size })
      });
      const data = await response.json();

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      alert(data?.error || 'Checkout is not available yet.');
    } catch {
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
          <select value={size} onChange={(event) => setSize(event.target.value)} aria-label={`Select size for ${product.name}`}>
            {sizes.map((sizeOption) => <option key={sizeOption} value={sizeOption}>{sizeOption}</option>)}
          </select>
        </div>
        <button type="button" className="checkout" onClick={checkout} disabled={loading}>
          {loading ? 'Starting checkout...' : 'Checkout'}
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <main>
      <header className="nav">
        <div className="brand">SAINT MERIDIAN</div>
        <nav>
          <a href="#shop">Shop</a>
          <button type="button" onClick={() => document.querySelector('.chatButton')?.click()}>Support</button>
        </nav>
      </header>

      <section className="hero">
        <div className="heroText">
          <p className="eyebrow">TEST DROP</p>
          <h1>Black and white essentials.</h1>
          <p className="heroCopy">A clean Saint Meridian shopping experience with premium product presentation, simple sizing, and easy checkout.</p>
          <a className="heroButton" href="#shop">Shop the drop</a>
        </div>
        <div className="heroImage">
          <img src="/images/black-hoodie.png" alt="Saint Meridian black hoodie" />
        </div>
      </section>

      <section className="trustBar" aria-label="Store details">
        <span>Sizes S–XXL</span>
        <span>3–5 business days</span>
        <span>Professional support</span>
      </section>

      <section id="shop" className="shop">
        <div className="sectionTitle">
          <p>SHOP</p>
          <h2>Saint Meridian essentials</h2>
        </div>
        <div className="grid">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="supportBox">
        <h2>Need help?</h2>
        <p>Use the Customer Service button at the bottom-right. The agent answers questions about order numbers, shirt sizes, and delivery times directly on this website.</p>
      </section>

      <footer>
        <strong>SAINT MERIDIAN</strong>
        <span>Minimal essentials in black and white.</span>
      </footer>

      <CustomerServiceAgent />
    </main>
  );
}
