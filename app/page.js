'use client';

import { useMemo, useState } from 'react';

const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

const products = [
  {
    id: 'black-hoodie',
    name: 'Saint Meridian Hoodie - Black',
    type: 'Heavyweight Hoodie',
    price: 100,
    image: '/images/black-hoodie.png',
    description: 'Premium black heavyweight hoodie with a clean Saint Meridian mark.'
  },
  {
    id: 'white-hoodie',
    name: 'Saint Meridian Hoodie - White',
    type: 'Heavyweight Hoodie',
    price: 100,
    image: '/images/white-hoodie.png',
    description: 'Premium white heavyweight hoodie with a bold black Saint Meridian mark.'
  },
  {
    id: 'black-tee',
    name: 'Saint Meridian T-Shirt Black',
    type: 'Box Tee',
    price: 75,
    image: '/images/black-tee.png',
    description: 'Structured black T-shirt with a clean Saint Meridian front graphic.'
  },
  {
    id: 'white-tee',
    name: 'Saint Meridian T-Shirt White',
    type: 'Box Tee',
    price: 75,
    image: '/images/white-tee.png',
    description: 'Structured white T-shirt with a clean Saint Meridian front graphic.'
  }
];

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function SupportChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'agent', text: 'Hello, welcome to Saint Meridian support. How can I help you today?' }
  ]);

  function answer(text) {
    const q = text.toLowerCase();
    if (q.includes('size') || q.includes('sizing') || q.includes('xl') || q.includes('xxl')) {
      return 'Our current sizes are S, M, L, XL, and XXL. If you are between sizes, we recommend sizing up for a more relaxed fit.';
    }
    if (q.includes('order') || q.includes('number') || q.includes('track')) {
      return 'I can help with order questions. Please include your order number and the email used at checkout so support can review the order details.';
    }
    if (q.includes('shipping') || q.includes('delivery') || q.includes('time') || q.includes('arrive')) {
      return 'Orders are expected to arrive in 3-5 business days after processing. You will receive checkout and order updates using the contact information entered at checkout.';
    }
    if (q.includes('return') || q.includes('exchange')) {
      return 'For returns or exchanges, please include your order number, item, size, and the reason for the request. We will review it professionally and help with the next step.';
    }
    if (q.includes('checkout') || q.includes('pay') || q.includes('payment')) {
      return 'Checkout is handled securely. Add your item and size to the cart, then press Checkout. No private checkout keys are shown on the website.';
    }
    return 'Thank you for reaching out. I can help with order numbers, shirt sizes, delivery times, checkout, returns, and product details. Please send your question and include your order number if you have one.';
  }

  function sendMessage(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages((current) => [...current, { role: 'customer', text }, { role: 'agent', text: answer(text) }]);
    setInput('');
  }

  return (
    <div className="supportShell">
      {open && (
        <div className="supportPanel" role="dialog" aria-label="Customer support chat">
          <div className="supportHeader">
            <div>
              <strong>Customer Support</strong>
              <span>Saint Meridian assistant</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close support">×</button>
          </div>
          <div className="supportMessages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>{message.text}</div>
            ))}
          </div>
          <form className="supportForm" onSubmit={sendMessage}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about orders, sizes, or delivery..." />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
      <button className="supportButton" type="button" onClick={() => setOpen(true)}>
        Customer Support
      </button>
    </div>
  );
}

export default function Home() {
  const [selectedSizes, setSelectedSizes] = useState(Object.fromEntries(products.map((product) => [product.id, 'M'])));
  const [cart, setCart] = useState([]);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  function addToCart(product) {
    const size = selectedSizes[product.id] || 'M';
    setCart((current) => {
      const found = current.find((item) => item.id === product.id && item.size === size);
      if (found) {
        return current.map((item) => item.id === product.id && item.size === size ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { ...product, size, quantity: 1 }];
    });
  }

  function removeFromCart(index) {
    setCart((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function checkout() {
    setCheckoutMessage('');
    if (!cart.length) {
      setCheckoutMessage('Add an item to your cart first.');
      return;
    }
    setCheckingOut(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: cart.map(({ id, size, quantity }) => ({ id, size, quantity })) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Checkout failed.');
      window.location.href = data.url;
    } catch (error) {
      setCheckoutMessage(error.message);
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <main>
      <header className="nav">
        <a href="#top" className="brand">SAINT MERIDIAN</a>
        <nav>
          <a href="#shop">Shop</a>
          <a href="#support">Support</a>
          <a href="#checkout">Checkout</a>
        </nav>
      </header>

      <section id="top" className="hero">
        <p className="eyebrow">Luxury Streetwear</p>
        <h1>Professional black and white essentials.</h1>
        <p>Saint Meridian test drop featuring heavyweight hoodies and structured T-shirts.</p>
        <a href="#shop" className="primaryLink">Shop collection</a>
      </section>

      <section id="shop" className="shopSection">
        <div className="sectionIntro">
          <p className="eyebrow">Collection</p>
          <h2>Featured products</h2>
        </div>
        <div className="productGrid">
          {products.map((product) => (
            <article className="productCard" key={product.id}>
              <div className="imageWrap">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="productInfo">
                <p className="productType">{product.type}</p>
                <div className="productTitleRow">
                  <h3>{product.name}</h3>
                  <strong>{money(product.price)}</strong>
                </div>
                <p>{product.description}</p>
                <div className="buyRow">
                  <select
                    aria-label={`Size for ${product.name}`}
                    value={selectedSizes[product.id]}
                    onChange={(event) => setSelectedSizes((current) => ({ ...current, [product.id]: event.target.value }))}
                  >
                    {sizes.map((size) => <option key={size} value={size}>{size}</option>)}
                  </select>
                  <button type="button" onClick={() => addToCart(product)}>Add to cart</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="checkout" className="cartSection">
        <div>
          <p className="eyebrow">Secure checkout</p>
          <h2>Your cart</h2>
          <p>{cart.length ? 'Review your selected items before checkout.' : 'Your cart is currently empty.'}</p>
        </div>
        <div className="cartBox">
          {cart.map((item, index) => (
            <div className="cartItem" key={`${item.id}-${item.size}-${index}`}>
              <span>{item.name} / {item.size} × {item.quantity}</span>
              <button type="button" onClick={() => removeFromCart(index)}>Remove</button>
            </div>
          ))}
          <div className="cartTotal"><span>Total</span><strong>{money(total)}</strong></div>
          <button className="checkoutButton" type="button" onClick={checkout} disabled={checkingOut || !cart.length}>
            {checkingOut ? 'Opening checkout...' : 'Checkout'}
          </button>
          {checkoutMessage && <p className="checkoutMessage">{checkoutMessage}</p>}
        </div>
      </section>

      <section id="support" className="supportSection">
        <p className="eyebrow">Customer service</p>
        <h2>Professional support, built in.</h2>
        <p>The on-site support assistant answers questions about order numbers, sizes S-XXL, checkout, returns, and 3-5 business day delivery timing.</p>
      </section>

      <footer>© 2026 Saint Meridian. All rights reserved.</footer>
      <SupportChat />
    </main>
  );
}
