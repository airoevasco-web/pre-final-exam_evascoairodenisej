
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
        <p className="col-span-full rounded-xl bg-white p-8 text-center text-slate-500">
          No products found in this category.
        </p>
      )
    }

    return items.map((product) => {
      const cartQuantity = product.cartQuantity ?? 0
      const availableQuantity = product.quantity - cartQuantity

      return (
        <article
          key={product.id}
          className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <img
            src={product.image}
            alt={product.name}
            className="h-48 w-full object-cover"
            onError={(event) => {
              event.currentTarget.onerror = null
              event.currentTarget.src =
                'https://placehold.co/600x400/fce7f3/9d174d?text=Product'
            }}
          />

          <div className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-pink-600">
              {product.category}
            </p>

            <h3 className="mt-1 text-lg font-bold text-slate-800">
              {product.name}
            </h3>

            <p className="mt-2 text-xl font-black text-pink-700">
              {money(product.price)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Inventory value: {money(product.price * product.quantity)}
            </p>

            <div className="mt-3">
              {product.quantity === 0 ? (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                  Sold Out
                </span>
              ) : product.quantity < 5 ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  Low Stock: {product.quantity}
                </span>
              ) : (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  In Stock: {product.quantity}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedProduct(product)}
              className="mt-4 w-full rounded-lg border border-pink-300 px-4 py-2 font-semibold text-pink-700 hover:bg-pink-50"
            >
              View Product Details
            </button>

            <button
              type="button"
              onClick={() => addToCart(product.id)}
              disabled={availableQuantity <= 0}
              className="mt-2 w-full rounded-lg bg-pink-600 px-4 py-2 font-bold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {availableQuantity <= 0 ? 'Unavailable' : 'Add to Cart'}
            </button>
          </div>
        </article>
      )
    })
  }

  if (selectedProduct) {
    const currentProduct =
      products.find((product) => product.id === selectedProduct.id) ??
      selectedProduct

    return (
      <ProductDetail
        key={currentProduct.id}
        product={currentProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />
    )
  }

  return (
    <div className="min-h-screen bg-pink-50 text-slate-800">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div>
            <h1 className="text-2xl font-black text-pink-700">
              Pretty Much Everything
            </h1>
            <p className="text-sm text-slate-500">
              Beauty finds, cute fits, and everyday essentials.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCartOpen((current) => !current)
              setCheckoutOpen(false)
              setCheckoutMessage('')
            }}
            className="rounded-xl bg-pink-600 px-5 py-3 font-bold text-white hover:bg-pink-700"
          >
            {cartOpen ? 'Close Cart' : `My Cart (${cartCount})`}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-5 py-8">
        {cartOpen && (
          <section className="rounded-2xl border border-pink-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-pink-700">
              Shopping Cart
            </h2>

            {cartItems.length === 0 ? (
              <p className="mt-3 text-slate-500">Your cart is empty.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {cartItems.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-pink-100 pb-4"
                  >
                    <div>
                      <p className="font-bold">{product.name}</p>
                      <p className="text-sm text-slate-500">
                        {money(product.price)} × {product.cartQuantity}
                      </p>
                      <p className="text-sm font-semibold text-pink-700">
                        Subtotal:{' '}
                        {money(product.price * (product.cartQuantity ?? 0))}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => removeFromCart(product.id)}
                        aria-label={`Remove one ${product.name}`}
                        className="rounded-lg border border-pink-300 px-3 py-1 font-bold text-pink-700"
                      >
                        −
                      </button>

                      <span className="min-w-6 text-center font-bold">
                        {product.cartQuantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => addToCart(product.id)}
                        disabled={
                          (product.cartQuantity ?? 0) >= product.quantity
                        }
                        aria-label={`Add one ${product.name}`}
                        className="rounded-lg border border-pink-300 px-3 py-1 font-bold text-pink-700 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between">
                  <span className="font-bold">Cart Total</span>
                  <span className="text-xl font-black text-pink-700">
                    {money(cartTotal)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCheckoutOpen(true)
                    setCheckoutMessage('')
                  }}
                  className="w-full rounded-lg bg-pink-600 px-5 py-3 font-bold text-white hover:bg-pink-700"
                >
                  Proceed to Checkout →
                </button>
              </div>
            )}
          </section>
        )}

        {checkoutOpen && (
          <section className="rounded-2xl border border-pink-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-pink-700">Checkout</h2>
            <p className="mt-2 text-sm text-slate-500">
              Review your order and enter your delivery details.
            </p>

            <div className="mt-5 rounded-xl bg-pink-50 p-4">
              <h3 className="font-bold">Order Summary</h3>

              {cartItems.map((product) => (
                <div
                  key={product.id}
                  className="mt-3 flex justify-between gap-4 text-sm"
                >
                  <span>
                    {product.name} × {product.cartQuantity}
                  </span>
                  <span className="font-semibold">
                    {money(product.price * (product.cartQuantity ?? 0))}
                  </span>
                </div>
              ))}

              <div className="mt-4 flex justify-between border-t border-pink-200 pt-3">
                <span className="font-bold">Total Amount</span>
                <span className="text-xl font-black text-pink-700">
                  {money(cartTotal)}
                </span>
              </div>
            </div>

            {checkoutMessage && (
              <p
                role="status"
                className="mt-4 rounded-lg bg-green-100 p-4 text-sm font-semibold text-green-800"
              >
                {checkoutMessage}
              </p>
            )}

            {cartItems.length > 0 ? (
              <form onSubmit={handleCheckout} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Full Name
                  </label>
                  <input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-lg border border-pink-200 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Delivery Address
                  </label>
                  <textarea
                    value={customerAddress}
                    onChange={(event) => setCustomerAddress(event.target.value)}
                    placeholder="Enter your delivery address"
                    rows={3}
                    className="w-full rounded-lg border border-pink-200 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    value={customerContact}
                    onChange={(event) => setCustomerContact(event.target.value)}
                    placeholder="Enter your contact number"
                    className="w-full rounded-lg border border-pink-200 px-3 py-2"
                    required
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-pink-600 px-5 py-3 font-bold text-white hover:bg-pink-700"
                  >
                    Place Order
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutOpen(false)
                      setCheckoutMessage('')
                    }}
                    className="rounded-lg border border-pink-300 px-5 py-3 font-bold text-pink-700 hover:bg-pink-50"
                  >
                    Back to Cart
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setCheckoutOpen(false)
                  setCheckoutMessage('')
                }}
                className="mt-5 rounded-lg border border-pink-300 px-5 py-3 font-bold text-pink-700"
              >
                Continue Shopping
              </button>
            )}
          </section>
        )}

        {/* 1. Featured Products */}
        <section className="rounded-2xl border border-pink-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-2xl font-black text-pink-700">
              Featured Products
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Check out our featured beauty finds, cute fits, and everyday essentials.
            </p>
          </div>

          {products.length === 0 ? (
            <p className="rounded-xl bg-pink-50 p-8 text-center text-slate-500">
              No featured products available yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 3).map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-2xl border border-pink-100 bg-pink-50 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-56 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src =
                        'https://placehold.co/600x400/fce7f3/9d174d?text=Product'
                    }}
                  />

                  <div className="p-4">
                    <span className="inline-block rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-pink-700">
                      {product.category}
                    </span>

                    <h3 className="mt-3 text-lg font-bold text-slate-800">
                      {product.name}
                    </h3>

                    <p className="mt-2 text-xl font-black text-pink-700">
                      {money(product.price)}
                    </p>

                    <button
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      className="mt-4 w-full rounded-lg border border-pink-300 bg-white px-4 py-2 font-semibold text-pink-700 hover:bg-pink-100"
                    >
                      View Product Details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 2. Our Products */}
        <section>
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

          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedCategory === category
                    ? 'bg-pink-600 text-white'
                    : 'border border-pink-200 bg-white text-pink-700 hover:bg-pink-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {renderProductCards(filteredProducts)}
          </div>
        </section>

        {/* 3. Add a New Product — moved to the end */}
        <section className="rounded-2xl border border-pink-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-pink-700">
            Add a New Product
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Add a product to your store inventory.
          </p>

          {formMessage && (
            <p
              role="status"
              className={`mt-4 rounded-lg p-3 text-sm font-semibold ${
                formSuccess
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {formMessage}
            </p>
          )}

          <form
            onSubmit={handleAddProduct}
            className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div>
              <label className="mb-1 block text-sm font-semibold">
                Product Name
              </label>
              <input
                name="name"
                value={newProduct.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                className="w-full rounded-lg border border-pink-200 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold">
                Category
              </label>
              <input
                name="category"
                value={newProduct.category}
                onChange={handleInputChange}
                placeholder="Skincare, Makeup, Clothes"
                className="w-full rounded-lg border border-pink-200 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold">
                Image URL
              </label>
              <input
                name="image"
                type="url"
                value={newProduct.image}
                onChange={handleInputChange}
                placeholder="https://example.com/product.jpg"
                className="w-full rounded-lg border border-pink-200 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold">
                Price (₱)
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={newProduct.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                className="w-full rounded-lg border border-pink-200 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold">
                Quantity
              </label>
              <input
                name="quantity"
                type="number"
                min="0"
                step="1"
                value={newProduct.quantity}
                onChange={handleInputChange}
                placeholder="Enter stock quantity"
                className="w-full rounded-lg border border-pink-200 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold">
                Rating (0–5)
              </label>
              <input
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={newProduct.rating}
                onChange={handleInputChange}
                placeholder="e.g. 4.5"
                className="w-full rounded-lg border border-pink-200 px-3 py-2"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold">
                Description
              </label>
              <textarea
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
                placeholder="Describe the product"
                rows={3}
                className="w-full rounded-lg border border-pink-200 px-3 py-2"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-semibold">
                Specification
              </label>
              <textarea
                name="specification"
                value={newProduct.specification}
                onChange={handleInputChange}
                placeholder="Enter product specifications"
                rows={2}
                className="w-full rounded-lg border border-pink-200 px-3 py-2"
                required
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-pink-600 px-5 py-3 font-bold text-white hover:bg-pink-700 md:col-span-2"
            >
              Add Product
            </button>
          </form>
        </section>

        <footer className="py-4 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Pretty Much Everything
        </footer>
      </main>
    </div>
  )
}

export default App
