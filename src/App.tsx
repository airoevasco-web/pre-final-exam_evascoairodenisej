import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import type { Product } from './types'
import { initialProducts } from './products'
import ProductDetail from './ProductDetail'

function App() {
  const [products, setProducts] = useState<Product[]>(
    initialProducts.filter(
      (product) => product.name.trim().toLowerCase() !== 'test blush',
    ),
  )

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerContact, setCustomerContact] = useState('')
  const [checkoutMessage, setCheckoutMessage] = useState('')

  const [formMessage, setFormMessage] = useState('')
  const [formSuccess, setFormSuccess] = useState(false)

  const [newProduct, setNewProduct] = useState({
    image: '',
    name: '',
    category: '',
    description: '',
    specification: '',
    rating: '',
    price: '',
    quantity: '',
  })

  const categories = [
    'All',
    ...new Set(products.map((product) => product.category)),
  ]

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((product) => product.category === selectedCategory)

  const cartItems = products.filter(
    (product) => (product.cartQuantity ?? 0) > 0,
  )

  const cartCount = cartItems.reduce(
    (total, product) => total + (product.cartQuantity ?? 0),
    0,
  )

  const cartTotal = cartItems.reduce(
    (total, product) =>
      total + product.price * (product.cartQuantity ?? 0),
    0,
  )

  const inventoryTotal = products.reduce(
    (total, product) => total + product.price * product.quantity,
    0,
  )

  function money(amount: number) {
    return `₱${amount.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  function addToCart(productId: number, quantity = 1) {
    setProducts((currentProducts) =>
      currentProducts.map((product) => {
        if (product.id !== productId) return product

        const currentQuantity = product.cartQuantity ?? 0
        const availableStock = Math.max(
          0,
          product.quantity - currentQuantity,
        )
        const amountToAdd = Math.min(
          Math.max(0, quantity),
          availableStock,
        )

        return {
          ...product,
          cartQuantity: currentQuantity + amountToAdd,
        }
      }),
    )
  }

  function removeFromCart(productId: number) {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              cartQuantity: Math.max(
                0,
                (product.cartQuantity ?? 0) - 1,
              ),
            }
          : product,
      ),
    )
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target

    setNewProduct((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleAddProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormMessage('')
    setFormSuccess(false)

    const price = Number(newProduct.price)
    const quantity = Number(newProduct.quantity)
    const rating = Number(newProduct.rating)

    if (
      !newProduct.image.trim() ||
      !newProduct.name.trim() ||
      !newProduct.category.trim() ||
      !newProduct.description.trim() ||
      !newProduct.specification.trim() ||
      newProduct.price.trim() === '' ||
      newProduct.quantity.trim() === '' ||
      newProduct.rating.trim() === ''
    ) {
      setFormMessage('Please fill in all fields.')
      return
    }

    if (
      !Number.isFinite(price) ||
      !Number.isFinite(quantity) ||
      !Number.isFinite(rating) ||
      price < 0 ||
      quantity < 0 ||
      !Number.isInteger(quantity) ||
      rating < 0 ||
      rating > 5
    ) {
      setFormMessage(
        'Enter a valid price, whole-number quantity, and rating from 0 to 5.',
      )
      return
    }

    const productToAdd: Product = {
      id: Date.now(),
      image: newProduct.image.trim(),
      name: newProduct.name.trim(),
      category: newProduct.category.trim(),
      description: newProduct.description.trim(),
      specification: newProduct.specification.trim(),
      rating,
      price,
      quantity,
      cartQuantity: 0,
    }

    setProducts((current) => [...current, productToAdd])
    setSelectedCategory('All')

    setNewProduct({
      image: '',
      name: '',
      category: '',
      description: '',
      specification: '',
      rating: '',
      price: '',
      quantity: '',
    })

    setFormSuccess(true)
    setFormMessage('Product added successfully!')
  }

  function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCheckoutMessage('')

    if (cartItems.length === 0) {
      setCheckoutMessage('Your cart is empty.')
      return
    }

    if (
      !customerName.trim() ||
      !customerAddress.trim() ||
      !customerContact.trim()
    ) {
      setCheckoutMessage('Please complete all customer details.')
      return
    }

    const orderTotal = cartTotal
    const orderName = customerName.trim()

    setProducts((currentProducts) =>
      currentProducts.map((product) => {
        const orderedQuantity = product.cartQuantity ?? 0

        if (orderedQuantity <= 0) return product

        return {
          ...product,
          quantity: Math.max(0, product.quantity - orderedQuantity),
          cartQuantity: 0,
        }
      }),
    )

    setCheckoutMessage(
      `Order placed successfully! Thank you, ${orderName}. Your total is ${money(orderTotal)}.`,
    )

    setCustomerName('')
    setCustomerAddress('')
    setCustomerContact('')
  }

  function renderProductCards(items: Product[]) {
    if (items.length === 0) {
      return (
        <div className="col-span-full rounded-2xl border border-dashed border-pink-300 bg-white p-10 text-center">
          <p className="text-lg font-bold text-pink-700">
            No products found
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Try another category or add a new product.
          </p>
        </div>
      )
    }

    return items.map((product) => (
      <article
        key={product.id}
        className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      >
        <div className="h-52 overflow-hidden bg-pink-50">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        </div>

        <div className="p-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-pink-700">
              {product.category}
            </span>

            <span className="text-sm text-amber-500">
              ★ {product.rating.toFixed(1)}
            </span>
          </div>

          <h3 className="text-lg font-black text-slate-800">
            {product.name}
          </h3>

          <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-500">
            {product.description}
          </p>

          <p className="mt-3 text-xl font-black text-pink-700">
            {money(product.price)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Stock: {product.quantity}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Inventory value: {money(product.price * product.quantity)}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedProduct(product)}
              className="rounded-xl border border-pink-300 px-3 py-2 text-sm font-bold text-pink-700 transition hover:bg-pink-50"
            >
              View Details
            </button>

            <button
              type="button"
              onClick={() => addToCart(product.id)}
              disabled={
                product.quantity <= (product.cartQuantity ?? 0)
              }
              className="rounded-xl bg-pink-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </article>
    ))
  }

  const featuredProducts = products.slice(0, 3)

  return (
    <div className="min-h-screen bg-pink-50 text-slate-800">
      <header className="sticky top-0 z-30 border-b border-pink-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <a href="#home" className="text-2xl font-black text-pink-700">
            Pretty Much Everything
            <span className="ml-1 text-pink-400">♥</span>
          </a>

          <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold">
            <a href="#home" className="hover:text-pink-600">
              Home
            </a>
            <a href="#featured" className="hover:text-pink-600">
              Featured
            </a>
            <a href="#products" className="hover:text-pink-600">
              Products
            </a>
            <a href="#add-product" className="hover:text-pink-600">
              Add Product
            </a>

            <button
              type="button"
              onClick={() => {
                setCartOpen(!cartOpen)
                setCheckoutOpen(false)
              }}
              className="rounded-full bg-pink-600 px-5 py-2.5 font-bold text-white transition hover:bg-pink-700"
            >
              Cart ({cartCount})
            </button>
          </nav>
        </div>
      </header>

      <main id="home" className="mx-auto max-w-7xl space-y-16 px-5 py-10">
        <section className="grid items-center gap-8 overflow-hidden rounded-3xl bg-gradient-to-br from-pink-200 via-rose-100 to-white p-8 md:grid-cols-2 md:p-14">
          <div>
            <span className="inline-block rounded-full bg-white px-4 py-2 text-sm font-bold text-pink-700 shadow-sm">
              A little bit of everything
            </span>

            <h1 className="mt-5 text-4xl font-black leading-tight text-pink-800 md:text-6xl">
              Pretty finds for your everyday life.
            </h1>

            <p className="mt-5 max-w-xl leading-7 text-slate-600">
              Discover beauty, fashion, and everyday essentials in one place.
              Find something you love and make it yours.
            </p>

            <a
              href="#products"
              className="mt-7 inline-block rounded-full bg-pink-600 px-7 py-3 font-bold text-white shadow-md transition hover:bg-pink-700"
            >
              Explore Products
            </a>
          </div>

          <div className="rounded-3xl bg-white/70 p-5 shadow-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="overflow-hidden rounded-2xl bg-pink-100">
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80"
                  alt="Everyday accessories"
                  className="h-48 w-full object-cover"
                />
              </div>

              <div className="mt-8 overflow-hidden rounded-2xl bg-rose-100">
                <img
                  src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=80"
                  alt="Beauty products"
                  className="h-48 w-full object-cover"
                />
              </div>

              <div className="col-span-2 rounded-2xl bg-white p-4 text-center">
                <p className="text-lg font-black text-pink-700">
                  Your next favorite find
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Shop your style. Love your finds.
                </p>
              </div>
            </div>
          </div>
        </section>

        {selectedProduct && (
          <ProductDetail
            key={selectedProduct.id}
            product={
              products.find((product) => product.id === selectedProduct.id) ??
              selectedProduct
            }
            onClose={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
          />
        )}

        {cartOpen && (
          <section className="rounded-3xl border border-pink-200 bg-white p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-pink-700">
                  Your Shopping Cart
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Review your selected items before checkout.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-full border border-pink-200 px-4 py-2 text-sm font-bold text-pink-700 hover:bg-pink-50"
              >
                Close Cart
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="mt-6 rounded-2xl bg-pink-50 p-8 text-center">
                <p className="text-lg font-bold text-pink-700">
                  Your cart is empty.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Add something you love from our products.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {cartItems.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-pink-100 p-4"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-20 w-20 rounded-xl bg-pink-50 object-cover"
                      />

                      <div>
                        <h3 className="font-bold text-slate-800">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {money(product.price)} each
                        </p>
                        <p className="mt-1 font-bold text-pink-700">
                          {money(
                            product.price * (product.cartQuantity ?? 0),
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id)}
                        className="h-9 w-9 rounded-full border border-pink-200 font-bold text-pink-700 hover:bg-pink-50"
                      >
                        −
                      </button>

                      <span className="min-w-5 text-center font-bold">
                        {product.cartQuantity ?? 0}
                      </span>

                      <button
                        type="button"
                        onClick={() => addToCart(product.id)}
                        disabled={
                          (product.cartQuantity ?? 0) >= product.quantity
                        }
                        className="h-9 w-9 rounded-full bg-pink-600 font-bold text-white hover:bg-pink-700 disabled:bg-slate-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-pink-100 pt-5">
                  <p className="text-lg font-bold text-slate-700">
                    Total: <span className="text-pink-700">{money(cartTotal)}</span>
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutOpen(true)
                      setCartOpen(false)
                      setCheckoutMessage('')
                    }}
                    className="rounded-full bg-pink-600 px-7 py-3 font-bold text-white hover:bg-pink-700"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {checkoutOpen && (
          <section className="rounded-3xl border border-pink-200 bg-white p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-pink-700">
                  Checkout
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter your details to complete your order.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCheckoutOpen(false)
                  setCartOpen(true)
                }}
                className="rounded-full border border-pink-200 px-4 py-2 text-sm font-bold text-pink-700 hover:bg-pink-50"
              >
                Back to Cart
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-pink-50 p-5">
              <h3 className="font-black text-pink-700">Order Summary</h3>

              {cartItems.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  No items in your cart.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {cartItems.map((product) => (
                    <div
                      key={product.id}
                      className="flex justify-between gap-3 text-sm"
                    >
                      <span>
                        {product.name} × {product.cartQuantity}
                      </span>
                      <span className="font-bold">
                        {money(
                          product.price * (product.cartQuantity ?? 0),
                        )}
                      </span>
                    </div>
                  ))}

                  <div className="flex justify-between border-t border-pink-200 pt-3 font-black">
                    <span>Total</span>
                    <span className="text-pink-700">
                      {money(cartTotal)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleCheckout} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="customerName"
                  className="mb-1 block text-sm font-bold"
                >
                  Full Name
                </label>
                <input
                  id="customerName"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="customerAddress"
                  className="mb-1 block text-sm font-bold"
                >
                  Delivery Address
                </label>
                <textarea
                  id="customerAddress"
                  value={customerAddress}
                  onChange={(event) => setCustomerAddress(event.target.value)}
                  className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  placeholder="Enter your complete address"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="customerContact"
                  className="mb-1 block text-sm font-bold"
                >
                  Contact Number
                </label>
                <input
                  id="customerContact"
                  type="tel"
                  value={customerContact}
                  onChange={(event) => setCustomerContact(event.target.value)}
                  className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  placeholder="Enter your contact number"
                  required
                />
              </div>

              {checkoutMessage && (
                <p
                  role="status"
                  className={`rounded-xl p-4 text-sm font-semibold ${
                    checkoutMessage.startsWith('Order placed')
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {checkoutMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={cartItems.length === 0}
                className="w-full rounded-full bg-pink-600 px-6 py-3 font-bold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Place Order
              </button>
            </form>
          </section>
        )}

        <section id="featured">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-pink-500">
                Handpicked for you
              </p>
              <h2 className="mt-2 text-3xl font-black text-pink-800">
                Featured Products
              </h2>
              <p className="mt-2 text-slate-500">
                Check out some of our favorite finds.
              </p>
            </div>

            <a
              href="#products"
              className="font-bold text-pink-700 hover:text-pink-900"
            >
              View All Products →
            </a>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {renderProductCards(featuredProducts)}
          </div>
        </section>

        <section id="products">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-pink-700">
                Our Products
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Browse all available products in our store.
              </p>
            </div>

            <span className="rounded-full bg-pink-100 px-4 py-2 text-sm font-bold text-pink-700">
              {filteredProducts.length} Products
            </span>
          </div>

          <div className="mb-5 rounded-xl border border-pink-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Total Inventory Value
            </p>
            <p className="mt-1 text-2xl font-black text-pink-700">
              {money(inventoryTotal)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Total value of all products currently in stock.
            </p>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  selectedCategory === category
                    ? 'bg-pink-600 text-white'
                    : 'border border-pink-200 bg-white text-pink-700 hover:bg-pink-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {renderProductCards(filteredProducts)}
          </div>
        </section>

        <section
          id="add-product"
          className="rounded-3xl border border-pink-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-widest text-pink-500">
              Product Management
            </p>
            <h2 className="mt-2 text-2xl font-black text-pink-800">
              Add a New Product
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Fill in the details below to add a product to your store.
            </p>
          </div>

          <form onSubmit={handleAddProduct} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="image"
                  className="mb-1 block text-sm font-bold"
                >
                  Image URL
                </label>
                <input
                  id="image"
                  name="image"
                  type="url"
                  value={newProduct.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-sm font-bold"
                >
                  Product Name
                </label>
                <input
                  id="name"
                  name="name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="mb-1 block text-sm font-bold"
                >
                  Category
                </label>
                <input
                  id="category"
                  name="category"
                  value={newProduct.category}
                  onChange={handleInputChange}
                  placeholder="e.g. Skincare, Makeup, Clothes"
                  className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="mb-1 block text-sm font-bold"
                >
                  Price (₱)
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="quantity"
                  className="mb-1 block text-sm font-bold"
                >
                  Quantity
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={newProduct.quantity}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="rating"
                  className="mb-1 block text-sm font-bold"
                >
                  Rating (0–5)
                </label>
                <input
                  id="rating"
                  name="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={newProduct.rating}
                  onChange={handleInputChange}
                  placeholder="5"
                  className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-bold"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                placeholder="Describe the product"
                rows={3}
                className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                required
              />
            </div>

            <div>
              <label
                htmlFor="specification"
                className="mb-1 block text-sm font-bold"
              >
                Specifications
              </label>
              <textarea
                id="specification"
                name="specification"
                value={newProduct.specification}
                onChange={handleInputChange}
                placeholder="Enter product specifications"
                rows={3}
                className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                required
              />
            </div>

            {formMessage && (
              <p
                role="status"
                className={`rounded-xl p-4 text-sm font-semibold ${
                  formSuccess
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {formMessage}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-full bg-pink-600 px-6 py-3 font-bold text-white transition hover:bg-pink-700 sm:w-auto"
            >
              Add Product
            </button>
          </form>
        </section>
      </main>

      <footer className="mt-12 bg-pink-800 px-5 py-8 text-center text-sm text-white">
        <p className="text-lg font-black">Pretty Much Everything ♥</p>
        <p className="mt-2 text-pink-100">
          Your everyday finds, all in one place.
        </p>
        <p className="mt-4 text-pink-200">
          © {new Date().getFullYear()} Pretty Much Everything. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default App