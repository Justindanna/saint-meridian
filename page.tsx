'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
};

const products: Product[] = [
  {
    id: 'white-hoodie',
    name: 'Saint Meridian Hoodie - White',
    price: 398,
    image: '/products/white-hoodie.jpg',
    description: 'Premium heavyweight hoodie in polished white with a clean luxury silhouette.'
  },
  {
    id: 'black-hoodie',
    name: 'Saint Meridian Hoodie - Black',
    price: 318,
    image: '/products/black-hoodie.jpg',
    description: 'Premium heavyweight hoodie in deep black with a refined minimalist finish.'
  },
  {
    id: 'white-shirt',
    name: 'Saint Meridian T-Shirt White',
    price: 318,
    image: '/products/white-shirt.jpg',
    description: 'Elevated white tee made for everyday luxury and a structured fit.'
  },
  {
    id: 'black-shirt',
    name: 'Saint Meridian T-Shirt black',
    price: 318,
    image: '/products/black-shirt.jpg',
    description: 'Elevated black tee with a quiet premium feel and simple finish.'
  }
];

async function checkout(cart: { id: string; size: string; quantity: number }[]) {
  if (!cart.length) return;
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart })
  });
  const data = await res.json();
  if (data?.url) window.location.href = data.url;
  else alert(data?.error || 'Checkout is not available right now.');
}

export default function Page() {
  const [cart, setCart] = useState<{ id: string; size: string; quantity: number }[]>([]);
  const [sizes, setSizes] = useState<Record<string, string>>({});

  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.id);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
  }, [cart]);

  function addToCart(product: Product) {
    const size = sizes[product.id] || 'M';
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id && item.size === size);
      if (existing) {
        return current.map((item) =>
          item.id === product.id && item.size === size ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { id: product.id, size, quantity: 1 }];
    });
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top">SAINT MERIDIAN</a>
        <nav>
          <a href="#shop">Shop</a>
          <a href="#support">Support</a>
          <a href="#checkout">Checkout</a>
        </nav>
      </header>

      <section id="top" className="hero">
        <p className="eyebrow">LUXURY STREETWEAR</p>
        <h1>Polished essentials in black and white.</h1>
        <p>A simple, premium shopping experience built for Saint Meridian.</p>
        <a className="pill" href="#shop">Shop collection</a>
      </section>

      <section id="shop" className="productsSection">
        <div className="sectionLabel">COLLECTION</div>
        <h2>Featured products</h2>
        <div className="productGrid">
          {products.map((product) => (
            <article className="productCard" key={product.id}>
              <div className="imageWrap">
                <Image src={product.image} alt={product.name} fill sizes="(max-width: 900px) 100vw, 25vw" />
              </div>
              <div className="thumbs" aria-hidden="true">
                <span></span><span></span><span></span>
              </div>
              <div className="productTitleRow">
                <h3>{product.name}</h3>
                <strong>${product.price}</strong>
              </div>
              <p>{product.description}</p>
              <div className="buyRow">
                <select
                  aria-label={`Size for ${product.name}`}
                  value={sizes[product.id] || 'M'}
                  onChange={(e) => setSizes({ ...sizes, [product.id]: e.target.value })}
                >
                  <option>S</option>
                  <option>M</option>
                  <option>L</option>
                  <option>XL</option>
                  <option>2XL</option>
                </select>
                <button onClick={() => addToCart(product)}>Add to cart</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="checkout" className="cartSection">
        <div>
          <p className="eyebrow light">SECURE CHECKOUT</p>
          <h2>Your cart</h2>
          <p>{cart.length ? `${cart.length} item${cart.length === 1 ? '' : 's'} in your cart.` : 'Your cart is currently empty.'}</p>
        </div>
        <div className="cartBox">
          <div className="totalRow"><span>Total</span><strong>${total}</strong></div>
          <button disabled={!cart.length} onClick={() => checkout(cart)}>Checkout</button>
        </div>
      </section>

      <section id="support" className="supportSection">
        <div>
          <p className="eyebrow">CUSTOMER SERVICE</p>
          <h2>Professional support, built in.</h2>
          <p>The customer service agent can answer questions about shirt sizes, order numbers, delivery timing, checkout, returns, and product details.</p>
        </div>
        <button className="floatingSupport">💬 <span><strong>Customer Support</strong><small>Chat with us</small></span></button>
      </section>

      <footer>© 2026 Saint Meridian. All rights reserved.</footer>
    </main>
  );
}
