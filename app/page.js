'use client';

import { useMemo, useState } from 'react';

const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

const products = [
  {
    id: 'black-hoodie',
    name: 'Black Hoodie',
    fullName: 'Saint Meridian Hoodie — Black',
    price: 100,
    image: '/images/black-hoodie.png',
    type: 'Hoodie',
    fit: 'Oversized heavyweight fit',
    description: 'Premium black hoodie with a clean Saint Meridian chest mark.'
  },
  {
    id: 'white-hoodie',
    name: 'White Hoodie',
    fullName: 'Saint Meridian Hoodie — White',
    price: 100,
    image: '/images/white-hoodie.png',
    type: 'Hoodie',
    fit: 'Oversized heavyweight fit',
    description: 'Bright white hoodie with a sharp black Saint Meridian print.'
  },
  {
    id: 'black-tee',
    name: 'Black Tee',
    fullName: 'Saint Meridian T-Shirt — Black',
    price: 75,
    image: '/images/black-tee.png',
    type: 'T-Shirt',
    fit: 'Box tee silhouette',
    description: 'Black box tee with the Saint Meridian mark centered on the chest.'
  },
  {
    id: 'white-tee',
    name: 'White Tee',
    fullName: 'Saint Meridian T-Shirt — White',
    price: 75,
    image: '/images/white-tee.png',
    type: 'T-Shirt',
    fit: 'Box tee silhouette',
    description: 'White box tee with the Saint Meridian logo in a clean luxury layout.'
  }
];

function supportReply(value) {
  const text = value.toLowerCase();

  if (text.includes('order') || text.includes('number') || text.includes('track') || text.includes('#')) {
    return 'Of course. Please enter your order number and we can help review it. Saint Meridian order timing is typically 3–5 business days.';
  }

  if (text.includes('size') || text.includes('sizing') || text.includes('small') || text.includes('medium') || text.includes('large') || text.includes('xl') || text.includes('xxl') || ['s', 'm', 'l'].includes(text.trim())) {
    return 'Saint Meridian currently offers sizes S, M, L, XL, and XXL. For a relaxed fit, choose your normal size. For a roomier oversized fit, size up.';
  }

  if (text.includes('shipping') || text.includes('delivery') || text.includes('arrive') || text.includes('time') || text.includes('long')) {
    return 'Saint Meridian order times are typically 3–5 business days. You will receive order updates after checkout.';
  }

  if (text.includes('return') || text.includes('refund') || text.includes('exchange')) {
    return 'I can help with that. Please include your order number and a brief description of the issue so support can review it professionally.';
  }

  if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
    return 'Hello. Thank you for reaching out to Saint Meridian. I can help with sizing, order numbers, and delivery timing.';
  }

  return 'Thank you for contacting Saint Meridian Support. I can help with order numbers, sizes S–XXL, and order timing. Standard order timing is 3–5 business days.';
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
    setMessages((current) => [...current, { from: 'customer', text: clean }, { from: 'agent', text: supportReply(clean) }]);
    setInput('');
  }

  return (
    <>
      <button type="button" className="chatLaunch" onClick={() => setOpen((current) => !current)}>
        Customer Service
      </button>
      {open && (
        <section className="chatPanel" aria-label="Saint Meridian customer service chat">
          <div className="chatHeader">
            <div>
              <strong>Saint Meridian Support</strong>
              <span>Online now</span>
            </div>
            <button type="button" aria-label="Close customer service" onClick={() => setOpen(false)}>×</button>
          </div>
          <div className="quickHelp">
            <button type="button" onClick={() => setMessages((m) => [...m, { from: 'customer', text: 'What sizes do you have?' }, { from: 'agent', text: supportReply('sizes') }])}>Sizes</button>
            <button type="button" onClick={() => setMessages((m) => [...m, { from: 'customer', text: 'How long does delivery take?' }, { from: 'agent', text: supportReply('delivery time') }])}>Delivery</button>
            <button type="button" onClick={() => setMessages((m) => [...m, { from: 'customer', text: 'I have an order number' }, { from: 'agent', text: supportReply('order number') }])}>Order #</button>
          </div>
          <div className="chatBody">
            {messages.map((message, index) => (
              <p key={`${message.from}-${index}`} className={message.from === 'agent' ? 'agentMessage' : 'customerMessage'}>{message.text}</p>
            ))}
          </div>
          <form className="chatForm" onSubmit={sendMessage}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about orders, sizes, or delivery" />
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
    setLoading(true);
    try {
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
      <div className="productImageBox">
        <img src={product.image} alt={product.fullName} loading="eager" decoding="async" />
      </div>
      <div className="productContent">
        <div className="productMeta"><span>{product.type}</span><span>{product.fit}</span></div>
        <h3>{product.fullName}</h3>
        <p>{product.description}</p>
        <div className="sizeRow" role="radiogroup" aria-label={`Select size for ${product.fullName}`}>
          {sizes.map((option) => (
            <button key={option} type="button" className={size === option ? 'activeSize' : ''} onClick={() => setSize(option)}>{option}</button>
          ))}
        </div>
        <div className="purchaseRow">
          <strong>${product.price}</strong>
          <button type="button" className="checkoutButton" onClick={checkout} disabled={loading}>{loading ? 'Starting…' : 'Checkout'}</button>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const featured = useMemo(() => products.slice(0, 4), []);

  return (
    <main>
      <header className="navBar">
        <a className="brand" href="#top" aria-label="Saint Meridian home">SAINT MERIDIAN</a>
        <nav>
          <a href="#shop">Shop</a>
          <a href="#details">Details</a>
          <button type="button" onClick={() => document.querySelector('.chatLaunch')?.click()}>Support</button>
        </nav>
      </header>

      <section id="top" className="heroSection">
        <div className="heroCopy">
          <p className="eyebrow">TEST DROP / BLACK & WHITE</p>
          <h1>Premium essentials. Clean presentation.</h1>
          <p>Saint Meridian is built for a simple, sharp shopping experience with high-quality product imagery, direct checkout, and on-site support.</p>
          <div className="heroActions">
            <a href="#shop">Shop now</a>
            <button type="button" onClick={() => document.querySelector('.chatLaunch')?.click()}>Ask support</button>
          </div>
        </div>
        <div className="heroGallery" aria-label="Saint Meridian products">
          {featured.map((product, index) => (
            <div className={`heroTile heroTile${index + 1}`} key={product.id}>
              <img src={product.image} alt={product.fullName} loading="eager" decoding="async" />
            </div>
          ))}
        </div>
      </section>

      <section className="storeStrip">
        <span>Sizes S / M / L / XL / XXL</span>
        <span>Order timing 3–5 business days</span>
        <span>Customer service stays on site</span>
      </section>

      <section id="shop" className="shopSection">
        <div className="sectionHeading">
          <p className="eyebrow">SHOP THE DROP</p>
          <h2>High-quality Saint Meridian mockups</h2>
        </div>
        <div className="productGrid">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section id="details" className="detailsSection">
        <div>
          <p className="eyebrow">SERVICE</p>
          <h2>Built for simple support.</h2>
        </div>
        <div className="detailCards">
          <article><h3>Sizes</h3><p>All current products list sizes S, M, L, XL, and XXL.</p></article>
          <article><h3>Orders</h3><p>The support agent can ask for and respond to order-number questions.</p></article>
          <article><h3>Timing</h3><p>Customers are told order timing is typically 3–5 business days.</p></article>
        </div>
      </section>

      <footer className="footer">
        <strong>SAINT MERIDIAN</strong>
        <span>Black and white essentials.</span>
      </footer>

      <CustomerServiceAgent />
    </main>
  );
}
