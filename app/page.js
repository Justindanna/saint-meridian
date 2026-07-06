'use client';

import { useMemo, useState } from 'react';

const products = [
  {
    id: 'saint-meridian-hoodie-black',
    name: 'Saint Meridian Hoodie - Black',
    price: 80,
    image: '/products/hoodie-black.jpg?v=4',
    description: 'Heavyweight black hoodie with the Saint Meridian mark.',
    colors: ['#f4f1ec', '#111111', '#d8d2c6']
  },
  {
    id: 'saint-meridian-hoodie-white',
    name: 'Saint Meridian Hoodie - White',
    price: 80,
    image: '/products/hoodie-white.jpg?v=4',
    description: 'Heavyweight white hoodie with the Saint Meridian mark.',
    colors: ['#f4f1ec', '#e4e0d8', '#ffffff']
  },
  {
    id: 'saint-meridian-shirt-black',
    name: 'Saint Meridian T-Shirt - Black',
    price: 50,
    image: '/products/tee-black.jpg?v=4',
    description: 'Clean black premium T-shirt with Saint Meridian branding.',
    colors: ['#f4f1ec', '#ded9cf', '#111111']
  },
  {
    id: 'saint-meridian-shirt-white',
    name: 'Saint Meridian T-Shirt - White',
    price: 50,
    image: '/products/tee-white.jpg?v=4',
    description: 'Clean white premium T-shirt with Saint Meridian branding.',
    colors: ['#f4f1ec', '#e5e1d9', '#ffffff']
  }
];

export default function Home() {
  const [cart, setCart] = useState([]);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [sizes, setSizes] = useState({});
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price, 0), [cart]);

  const addToCart = (product) => {
    const size = sizes[product.id] || 'M';
    setCart((current) => [...current, { ...product, size }]);
  };

  const checkout = async () => {
    if (!cart.length) return;
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart.map(({ id, size }) => ({ id, size })) })
    });
    const data = await response.json();
    if (data.url) window.location.href = data.url;
    if (data.error) alert(data.error);
  };

  return (
    <main>
      <header className="nav">
        <a className="brand" href="#top">SAINT MERIDIAN</a>
        <nav>
          <a href="#shop">Shop</a>
          <a href="#support">Support</a>
          <a href="#checkout">Checkout</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">LUXURY STREETWEAR</p>
        <h1>Polished essentials in<br />black and white.</h1>
        <p className="subtitle">OFFICIAL DROP</p>
        <a href="#shop" className="pill">Shop collection</a>
      </section>

      <section className="collection" id="shop">
        <div className="section-kicker">COLLECTION</div>
        <h2>Featured products</h2>
        <div className="grid">
          {products.map((product) => (
            <article className="card" key={product.id}>
              <img src={product.image} alt={product.name} />
              <div className="swatches">
                {product.colors.map((color) => <span key={color} style={{ backgroundColor: color }} />)}
              </div>
              <div className="product-row">
                <h3>{product.name}</h3>
                <strong>${product.price}</strong>
              </div>
              <p>{product.description}</p>
              <div className="buy-row">
                <select
                  value={sizes[product.id] || 'M'}
                  onChange={(event) => setSizes({ ...sizes, [product.id]: event.target.value })}
                  aria-label={`Size for ${product.name}`}
                >
                  <option>S</option>
                  <option>M</option>
                  <option>L</option>
                  <option>XL</option>
                  <option>XXL</option>
                </select>
                <button onClick={() => addToCart(product)}>Add to cart</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cart" id="checkout">
        <div>
          <p className="eyebrow">SECURE CHECKOUT</p>
          <h2>Your cart</h2>
          <p>{cart.length ? `${cart.length} item${cart.length === 1 ? '' : 's'} ready for checkout.` : 'Your cart is currently empty.'}</p>
        </div>
        <div className="checkout-box">
          <div className="total"><span>Total</span><strong>${total}</strong></div>
          <button onClick={checkout} disabled={!cart.length}>Checkout</button>
        </div>
      </section>

      <section className="support" id="support">
        <p className="eyebrow">CUSTOMER SERVICE</p>
        <h2>Professional support, built in.</h2>
        <p>Ask about sizes, order numbers, delivery timing, checkout, returns, and product details.</p>
      </section>

      <button
        type="button"
        className="support-pill"
        onClick={() => setSupportOpen((open) => !open)}
        aria-expanded={supportOpen}
        aria-controls="support-chat"
      >
        Customer Support<br /><span>Chat with us</span>
      </button>

      <div className={`support-chat ${supportOpen ? 'open' : ''}`} id="support-chat" role="dialog" aria-label="Customer support chat">
        <div className="support-chat-head">
          <div>
            <strong>Saint Meridian Support</strong>
            <small>Usually replies by email</small>
          </div>
          <button type="button" onClick={() => setSupportOpen(false)} aria-label="Close customer support">×</button>
        </div>
        <p>Hi — ask about sizes, orders, delivery, checkout, returns, or product details.</p>
        <div className="quick-actions">
          <button type="button" onClick={() => setSupportMessage('I need help choosing my size.')}>Sizing</button>
          <button type="button" onClick={() => setSupportMessage('I need help with my order number.')}>Order #</button>
          <button type="button" onClick={() => setSupportMessage('I have a delivery timing question.')}>Delivery</button>
        </div>
        <textarea
          value={supportMessage}
          onChange={(event) => setSupportMessage(event.target.value)}
          placeholder="Type your question here..."
          rows="4"
        />
        <a className="send-support" href={`mailto:support@saint-meridian.com?subject=Saint%20Meridian%20Support&body=${encodeURIComponent(supportMessage || 'Hi Saint Meridian Support, I need help with:')}`}>Send message</a>
      </div>
      <footer>© 2026 Saint Meridian. All rights reserved.</footer>
    </main>
  );
}
