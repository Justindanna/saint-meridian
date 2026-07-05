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

type CartItem = {
  id: string;
  size: string;
  quantity: number;
};

const products: Product[] = [
  {
    id: 'white-hoodie',
    name: 'Saint Meridian Hoodie - White',
    price: 398,
    image: '/products/white-hoodie.jpg',
    description: 'White hoodie with the Saint Meridian mark. Final material and fit details may depend on the fulfillment product selected.'
  },
  {
    id: 'black-hoodie',
    name: 'Saint Meridian Hoodie - Black',
    price: 318,
    image: '/products/black-hoodie.jpg',
    description: 'Black hoodie with the Saint Meridian mark. Final material and fit details may depend on the fulfillment product selected.'
  },
  {
    id: 'white-shirt',
    name: 'Saint Meridian T-Shirt White',
    price: 318,
    image: '/products/white-shirt.jpg',
    description: 'White Saint Meridian T-shirt for a clean black and white collection.'
  },
  {
    id: 'black-shirt',
    name: 'Saint Meridian T-Shirt black',
    price: 318,
    image: '/products/black-shirt.jpg',
    description: 'Black Saint Meridian T-shirt for a clean black and white collection.'
  }
];

async function startCheckout(cart: CartItem[]) {
  if (!cart.length) return;

  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart })
  });

  const data = await response.json();

  if (data?.url) {
    window.location.href = data.url;
    return;
  }

  alert(data?.error || 'Checkout is not available right now.');
}

export default function Page() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [supportOpen, setSupportOpen] = useState(false);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      const product = products.find((entry) => entry.id === item.id);
      return sum + (product?.price || 0) * item.quantity;
    }, 0);
  }, [cart]);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

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
        <nav aria-label="Main navigation">
          <a href="#shop">Shop</a>
          <a href="#support">Support</a>
          <a href="#checkout">Checkout</a>
        </nav>
      </header>

      <section id="top" className="hero">
        <p className="eyebrow">LUXURY STREETWEAR</p>
        <h1>Polished essentials in black and white.</h1>
        <p className="heroSub">Saint Meridian test drop featuring the current hoodie and T-shirt collection.</p>
        <a className="pill" href="#shop">Shop collection</a>
      </section>

      <section id="shop" className="productsSection" aria-labelledby="featured-heading">
        <div className="sectionIntro">
          <p className="sectionLabel">COLLECTION</p>
          <h2 id="featured-heading">Featured products</h2>
        </div>

        <div className="productGrid">
          {products.map((product) => (
            <article className="productCard" key={product.id}>
              <div className="imageWrap">
                <Image src={product.image} alt={product.name} fill sizes="(max-width: 900px) 100vw, 25vw" priority={product.id === 'white-hoodie'} />
              </div>

              <div className="thumbs" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>

              <div className="productTitleRow">
                <h3>{product.name}</h3>
                <strong>${product.price}</strong>
              </div>

              <p className="productDescription">{product.description}</p>

              <div className="buyRow">
                <select
                  aria-label={`Size for ${product.name}`}
                  value={sizes[product.id] || 'M'}
                  onChange={(event) => setSizes({ ...sizes, [product.id]: event.target.value })}
                >
                  <option>S</option>
                  <option>M</option>
                  <option>L</option>
                  <option>XL</option>
                  <option>2XL</option>
                </select>
                <button type="button" onClick={() => addToCart(product)}>Add to cart</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="checkout" className="cartSection" aria-labelledby="cart-heading">
        <div>
          <p className="eyebrow light">SECURE CHECKOUT</p>
          <h2 id="cart-heading">Your cart</h2>
          <p>{itemCount ? `${itemCount} item${itemCount === 1 ? '' : 's'} in your cart.` : 'Your cart is currently empty.'}</p>
        </div>

        <div className="cartBox">
          {cart.length > 0 && (
            <div className="cartItems">
              {cart.map((item) => {
                const product = products.find((entry) => entry.id === item.id);
                return (
                  <div key={`${item.id}-${item.size}`}>
                    <span>{product?.name} / {item.size} × {item.quantity}</span>
                    <strong>${(product?.price || 0) * item.quantity}</strong>
                  </div>
                );
              })}
            </div>
          )}
          <div className="totalRow"><span>Total</span><strong>${total}</strong></div>
          <button type="button" disabled={!cart.length} onClick={() => startCheckout(cart)}>Checkout</button>
        </div>
      </section>

      <section id="support" className="supportSection" aria-labelledby="support-heading">
        <div>
          <p className="eyebrow">CUSTOMER SERVICE</p>
          <h2 id="support-heading">Professional support, built in.</h2>
          <p>The customer service agent can answer questions about shirt sizes, order numbers, delivery timing, checkout, returns, and product details.</p>
        </div>
      </section>

      <button className="floatingSupport" type="button" onClick={() => setSupportOpen(!supportOpen)} aria-expanded={supportOpen}>
        <span className="chatIcon">●●</span>
        <span><strong>Customer Support</strong><small>Chat with us</small></span>
      </button>

      {supportOpen && (
        <aside className="supportPanel" aria-label="Customer support panel">
          <h3>Customer Support</h3>
          <p>For order, size, checkout, or return questions, include your order number if you have one.</p>
          <a href="mailto:support@saint-meridian.com">Email support</a>
        </aside>
      )}

      <footer>© 2026 Saint Meridian. All rights reserved.</footer>
    </main>
  );
}
