
import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { Product } from './types'
import { initialProducts } from './products'
import ProductDetail from './ProductDetail'

type CartItem = Product & {
  cartQuantity: number
}

function App() {
  const [products, setProducts] = useState<Product[]>(
    initialProducts.filter(
      (product) => product.name.toLowerCase() !== 'test blush',
    ),
  )

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerContact, setCustomerContact] = useState('')
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)

  const [productMessage, setProductMessage] = useState('')
  const [productSuccess, setProductSuccess] = useState(false)

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Skincare',
    image: '',
    description: '',
    specification: '',
    rating: '4.5',
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
      : products.filter(
          (product) => product.category === selectedCategory,
        )

  const featuredProducts = products.slice(0, 4)

  const cartItems: CartItem[] = products
    .filter((product) => (product.cartQuantity ?? 0) > 0)
    .map((product) => ({
      ...product,
      cartQuantity: product.cartQuantity ?? 0,
    }))

  const cartCount = cartItems.reduce(
    (total, product) => total + product.cartQuantity,
    0,
  )

  const cartTotal = cartItems.reduce(
    (total, product) => total + product.price * product.cartQuantity,
    0,
  )

  const inventoryTotal = products.reduce(
    (total, product) => total + product.price * product.quantity,
    0,
  )

  const money = (amount: number) =>
    `₱${amount.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const addToCart = (productId: number, quantity = 1) => {
    const product = products.find((item) => item.id === productId)

    if (!product) return

    const currentCartQuantity = product.cartQuantity ?? 0

    if (quantity < 1) return

    if (currentCartQuantity + quantity > product.quantity) {
      window.alert('Sorry, there is not enough stock for this product.')
      return
    }

    setProducts((currentProducts) =>
      currentProducts.map((item) =>
        item.id === productId
          ? {
              ...item,
              cartQuantity: (item.cartQuantity ?? 0) + quantity,
            }
          : item,
      ),
    )
  }

  const updateCartQuantity = (
    productId: number,
    change: number,
  ) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) => {
        if (product.id !== productId) return product

        const currentQuantity = product.cartQuantity ?? 0
        const nextQuantity = currentQuantity + change

        if (nextQuantity > product.quantity) {
          window.alert('You have reached the available stock.')
          return product
        }

        return {
          ...product,
          cartQuantity: Math.max(0, nextQuantity),
        }
      }),
    )
  }

  const removeFromCart = (productId: number) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? { ...product, cartQuantity: 0 }
          : product,
      ),
    )
  }

  const handleNewProductChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target

    setNewProduct((currentProduct) => ({
      ...currentProduct,
      [name]: value,
    }))
  }

  const handleAddProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProductMessage('')
    setProductSuccess(false)

    const price = Number(newProduct.price)
    const quantity = Number(newProduct.quantity)
    const rating = Number(newProduct.rating)

    if (
      !newProduct.name.trim() ||
      !newProduct.image.trim() ||
      !newProduct.description.trim() ||
      !newProduct.specification.trim() ||
      newProduct.price === '' ||
      newProduct.quantity === ''
    ) {
      setProductMessage('Please complete all product fields.')
      return
    }

    if (
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      !Number.isFinite(rating) ||
      rating < 0 ||
      rating > 5
    ) {
      setProductMessage(
        'Enter a valid price, whole-number stock quantity, and rating from 0 to 5.',
      )
      return
    }

    const nextId =
      products.length > 0
        ? Math.max(...products.map((product) => product.id)) + 1
        : 1

    const productToAdd: Product = {
      id: nextId,
      name: newProduct.name.trim(),
      category: newProduct.category,
      image: newProduct.image.trim(),
      description: newProduct.description.trim(),
      specification: newProduct.specification.trim(),
      rating,
      price,
      quantity,
      cartQuantity: 0,
    }

    setProducts((currentProducts) => [
      ...currentProducts,
      productToAdd,
    ])

    setNewProduct({
      name: '',
      category: 'Skincare',
      image: '',
      description: '',
      specification: '',
      rating: '4.5',
      price: '',
      quantity: '',
    })

    setProductSuccess(true)
    setProductMessage('Product added successfully!')
  }

  const openCheckout = () => {
    if (cartItems.length === 0) {
      window.alert('Your cart is empty. Add a product first.')
      return
    }

    setCheckoutMessage('')
    setCheckoutSuccess(false)
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }

  const handleCheckout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCheckoutMessage('')
    setCheckoutSuccess(false)

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

    const outOfStock = cartItems.some((item) => {
      const currentProduct = products.find(
        (product) => product.id === item.id,
      )

      return (
        !currentProduct ||
        item.cartQuantity > currentProduct.quantity
      )
    })

    if (outOfStock) {
      setCheckoutMessage(
        'Some products no longer have enough stock. Please review your cart.',
      )
      return
    }

    const orderTotal = cartTotal

    setProducts((currentProducts) =>
      currentProducts.map((product) => ({
        ...product,
        quantity:
          product.quantity - (product.cartQuantity ?? 0),
        cartQuantity: 0,
      })),
    )

    setCheckoutMessage(
      `Thank you, ${customerName.trim()}! Your order totaling ${money(orderTotal)} has been placed successfully.`,
    )
    setCheckoutSuccess(true)
  }

  const closeCheckout = () => {
    setIsCheckoutOpen(false)
    setCheckoutMessage('')
    setCheckoutSuccess(false)
    setCustomerName('')
    setCustomerAddress('')
    setCustomerContact('')
  }

  const renderProductCards = (items: Product[]) => (
    <div className="grid grid-cols-2 gap-3 sm:gap-5">
      {items.map((product) => (
        <article
          key={product.id}
          className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <button
            type="button"
            onClick={() => setSelectedProduct(product)}
            className="block w-full bg-pink-50"
            aria-label={`View ${product.name} details`}
          >
            <img
              src={product.image}
              alt={product.name}
              className="h-32 w-full object-cover sm:h-52"
              onError={(event) => {
                event.currentTarget.src =
                  'https://placehold.co/600x400/fce7f3/831843?text=Product'
              }}
            />
          </button>

          <div className="flex flex-1 flex-col p-3 sm:p-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-pink-500">
              {product.category}
            </p>

            <button
              type="button"
              onClick={() => setSelectedProduct(product)}
              className="mb-2 text-left text-sm font-bold text-gray-900 hover:text-pink-600 sm:text-lg"
            >
              {product.name}
            </button>

            <p className="mb-3 line-clamp-2 text-xs text-gray-500 sm:text-sm">
              {product.description}
            </p>

            <div className="mb-3 mt-auto flex flex-wrap items-center justify-between gap-1">
              <span className="text-sm font-bold text-pink-600 sm:text-lg">
                {money(product.price)}
              </span>

              <span className="text-xs text-gray-500">
                ⭐ {product.rating}
              </span>
            </div>

            <p className="mb-3 text-xs text-gray-500">
              {product.quantity > 0
                ? `${product.quantity} in stock`
                : 'Out of stock'}
            </p>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setSelectedProduct(product)}
                className="rounded-lg border border-pink-300 px-2 py-2 text-xs font-semibold text-pink-600 transition hover:bg-pink-50 sm:text-sm"
              >
                View Details
              </button>

              <button
                type="button"
                disabled={product.quantity <= (product.cartQuantity ?? 0)}
                onClick={() => addToCart(product.id)}
                className="rounded-lg bg-pink-500 px-2 py-2 text-xs font-semibold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:bg-gray-300 sm:text-sm"
              >
                {product.quantity <= (product.cartQuantity ?? 0)
                  ? 'Unavailable'
                  : 'Add to Cart'}
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-pink-50 text-gray-800">
      <header className="sticky top-0 z-30 border-b border-pink-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <a
            href="#home"
            className="text-lg font-extrabold tracking-tight text-pink-600 sm:text-2xl"
          >
            Pretty Much Everything
          </a>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative rounded-xl bg-pink-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-pink-600 sm:px-5"
          >
            🛒 Cart
            <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-pink-600">
              {cartCount}
            </span>
          </button>
        </div>
      </header>

      <main>
        <section
          id="home"
          className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-20 lg:px-8"
        >
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-pink-500">
              Your everyday favorites
            </p>

            <h1 className="mb-5 text-4xl font-extrabold leading-tight text-gray-900 sm:text-6xl">
              Find Your
              <span className="block text-pink-500">
                Everyday Essentials
              </span>
            </h1>

            <p className="mb-7 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">
              Discover skincare, makeup, and fashion favorites in one
              place. Find something you love and add it to your cart.
            </p>

            <a
              href="#products"
              className="inline-block rounded-xl bg-pink-500 px-6 py-3 font-bold text-white shadow-md transition hover:bg-pink-600"
            >
              Shop Products
            </a>
          </div>

          <div className="overflow-hidden rounded-3xl border-4 border-white bg-pink-100 shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=1000&q=80"
              alt="Beauty and skincare essentials"
              className="h-64 w-full object-cover sm:h-96"
            />
          </div>
        </section>

        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="mb-2 text-sm font-bold uppercase tracking-widest text-pink-500">
                  Handpicked for you
                </p>
                <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                  Featured Products
                </h2>
              </div>

              <a
                href="#products"
                className="text-sm font-bold text-pink-600 hover:text-pink-700"
              >
                View All Products →
              </a>
            </div>

            {featuredProducts.length > 0 ? (
              renderProductCards(featuredProducts)
            ) : (
              <p className="rounded-xl bg-pink-50 p-8 text-center text-gray-500">
                No featured products available yet.
              </p>
            )}
          </div>
        </section>

        <section
          id="products"
          className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
        >
          <div className="mb-7">
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-pink-500">
              Browse our collection
            </p>
            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              All Products
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Choose your favorites from our available collection.
            </p>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selectedCategory === category
                    ? 'bg-pink-500 text-white shadow'
                    : 'border border-pink-200 bg-white text-pink-600 hover:bg-pink-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {filteredProducts.length > 0 ? (
            renderProductCards(filteredProducts)
          ) : (
            <div className="rounded-2xl border border-dashed border-pink-300 bg-white p-10 text-center">
              <p className="font-semibold text-gray-700">
                No products in this category yet.
              </p>
            </div>
          )}
        </section>

        <section
          id="add-product"
          className="border-y border-pink-100 bg-white py-12 sm:py-16"
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-pink-500">
                Product management
              </p>
              <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
                Add a New Product
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Add a product to your collection.
              </p>
            </div>

            <form
              onSubmit={handleAddProduct}
              className="grid gap-5 rounded-2xl border border-pink-100 bg-pink-50 p-5 sm:grid-cols-2 sm:p-8"
            >
              <div>
                <label
                  htmlFor="productName"
                  className="mb-2 block text-sm font-semibold"
                >
                  Product Name
                </label>
                <input
                  id="productName"
                  name="name"
                  value={newProduct.name}
                  onChange={handleNewProductChange}
                  placeholder="Enter product name"
                  className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="productCategory"
                  className="mb-2 block text-sm font-semibold"
                >
                  Category
                </label>
                <select
                  id="productCategory"
                  name="category"
                  value={newProduct.category}
                  onChange={handleNewProductChange}
                  className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                >
                  <option value="Skincare">Skincare</option>
                  <option value="Makeup">Makeup</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="productImage"
                  className="mb-2 block text-sm font-semibold"
                >
                  Product Image URL
                </label>
                <input
                  id="productImage"
                  name="image"
                  type="url"
                  value={newProduct.image}
                  onChange={handleNewProductChange}
                  placeholder="https://example.com/product.jpg"
                  className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="productDescription"
                  className="mb-2 block text-sm font-semibold"
                >
                  Description
                </label>
                <textarea
                  id="productDescription"
                  name="description"
                  value={newProduct.description}
                  onChange={handleNewProductChange}
                  placeholder="Describe the product"
                  rows={3}
                  className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="productSpecification"
                  className="mb-2 block text-sm font-semibold"
                >
                  Specifications
                </label>
                <textarea
                  id="productSpecification"
                  name="specification"
                  value={newProduct.specification}
                  onChange={handleNewProductChange}
                  placeholder="Enter product specifications"
                  rows={2}
                  className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="productRating"
                  className="mb-2 block text-sm font-semibold"
                >
                  Rating (0–5)
                </label>
                <input
                  id="productRating"
                  name="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={newProduct.rating}
                  onChange={handleNewProductChange}
                  className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="productPrice"
                  className="mb-2 block text-sm font-semibold"
                >
                  Price (₱)
                </label>
                <input
                  id="productPrice"
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newProduct.price}
                  onChange={handleNewProductChange}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="productQuantity"
                  className="mb-2 block text-sm font-semibold"
                >
                  Stock Quantity
                </label>
                <input
                  id="productQuantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={newProduct.quantity}
                  onChange={handleNewProductChange}
                  placeholder="0"
                  className="w-full rounded-xl border border-pink-200 bg-white px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-pink-500 px-5 py-3 font-bold text-white transition hover:bg-pink-600"
                >
                  + Add Product
                </button>
              </div>

              {productMessage && (
                <p
                  role="status"
                  className={`sm:col-span-2 rounded-xl p-3 text-sm font-semibold ${
                    productSuccess
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {productMessage}
                </p>
              )}
            </form>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-pink-100 bg-white p-5">
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="mt-1 text-2xl font-extrabold text-pink-600">
                  {products.length}
                </p>
              </div>

              <div className="rounded-2xl border border-pink-100 bg-white p-5">
                <p className="text-sm text-gray-500">
                  Total Inventory Value
                </p>
                <p className="mt-1 text-2xl font-extrabold text-pink-600">
                  {money(inventoryTotal)}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 px-4 py-8 text-center text-sm text-white">
        <p className="font-bold text-pink-300">
          Pretty Much Everything
        </p>
        <p className="mt-2 text-gray-400">
          Your everyday favorites, all in one place.
        </p>
      </footer>

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(id, quantity) => {
            addToCart(id, quantity)
            setSelectedProduct(null)
          }}
        />
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close cart"
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-black/50"
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-pink-100 px-5 py-5">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  Your Shopping Cart
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {cartCount} item{cartCount === 1 ? '' : 's'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="rounded-full px-3 py-2 text-xl text-gray-500 hover:bg-pink-50 hover:text-pink-600"
                aria-label="Close shopping cart"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {cartItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="mb-4 text-5xl">🛍️</span>
                  <h3 className="text-lg font-bold text-gray-800">
                    Your cart is empty
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Add your favorite products to get started.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCartOpen(false)}
                    className="mt-5 rounded-xl bg-pink-500 px-5 py-3 font-bold text-white hover:bg-pink-600"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 border-b border-pink-100 pb-5"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-24 w-24 shrink-0 rounded-xl bg-pink-50 object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-pink-600">
                          {money(item.price)}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(item.id, -1)
                            }
                            className="h-8 w-8 rounded-lg border border-pink-200 font-bold text-pink-600 hover:bg-pink-50"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            −
                          </button>

                          <span className="min-w-5 text-center text-sm font-bold">
                            {item.cartQuantity}
                          </span>

                          <button
                            type="button"
                            disabled={
                              item.cartQuantity >= item.quantity
                            }
                            onClick={() =>
                              updateCartQuantity(item.id, 1)
                            }
                            className="h-8 w-8 rounded-lg border border-pink-200 font-bold text-pink-600 hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            +
                          </button>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto text-xs font-semibold text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-pink-100 bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-semibold text-gray-600">
                    Total
                  </span>
                  <span className="text-xl font-extrabold text-pink-600">
                    {money(cartTotal)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={openCheckout}
                  className="w-full rounded-xl bg-pink-500 px-5 py-4 font-bold text-white transition hover:bg-pink-600"
                >
                  Proceed to Checkout
                </button>

                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-3 w-full rounded-xl border border-pink-200 px-5 py-3 font-semibold text-pink-600 hover:bg-pink-50"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/60 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
            className="my-auto w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-pink-500">
                  Almost yours
                </p>
                <h2
                  id="checkout-title"
                  className="mt-1 text-2xl font-extrabold text-gray-900"
                >
                  {checkoutSuccess ? 'Order Confirmed!' : 'Checkout'}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeCheckout}
                className="rounded-full px-3 py-2 text-xl text-gray-500 hover:bg-pink-50 hover:text-pink-600"
                aria-label="Close checkout"
              >
                ✕
              </button>
            </div>

            {checkoutSuccess ? (
              <div className="py-5 text-center">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-600">
                  ✓
                </div>

                <p className="leading-7 text-gray-600">
                  {checkoutMessage}
                </p>

                <button
                  type="button"
                  onClick={closeCheckout}
                  className="mt-7 w-full rounded-xl bg-pink-500 px-5 py-3 font-bold text-white hover:bg-pink-600"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 rounded-2xl bg-pink-50 p-4">
                  <h3 className="mb-3 font-bold text-gray-900">
                    Order Summary
                  </h3>

                  <div className="max-h-40 space-y-3 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between gap-3 text-sm"
                      >
                        <span className="text-gray-600">
                          {item.name} × {item.cartQuantity}
                        </span>
                        <span className="shrink-0 font-semibold text-gray-800">
                          {money(item.price * item.cartQuantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-between border-t border-pink-200 pt-4">
                    <span className="font-bold">Total</span>
                    <span className="font-extrabold text-pink-600">
                      {money(cartTotal)}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <label
                      htmlFor="customerName"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Full Name
                    </label>
                    <input
                      id="customerName"
                      value={customerName}
                      onChange={(event) =>
                        setCustomerName(event.target.value)
                      }
                      placeholder="Enter your full name"
                      className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="customerAddress"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Delivery Address
                    </label>
                    <textarea
                      id="customerAddress"
                      value={customerAddress}
                      onChange={(event) =>
                        setCustomerAddress(event.target.value)
                      }
                      placeholder="Enter your complete address"
                      rows={2}
                      className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="customerContact"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Contact Number
                    </label>
                    <input
                      id="customerContact"
                      type="tel"
                      value={customerContact}
                      onChange={(event) =>
                        setCustomerContact(event.target.value)
                      }
                      placeholder="Enter your contact number"
                      className="w-full rounded-xl border border-pink-200 px-4 py-3 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                      required
                    />
                  </div>

                  {checkoutMessage && (
                    <p
                      role="alert"
                      className="rounded-xl bg-red-100 p-3 text-sm font-semibold text-red-700"
                    >
                      {checkoutMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={cartItems.length === 0}
                    className="w-full rounded-xl bg-pink-500 px-5 py-4 font-bold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    Place Order — {money(cartTotal)}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutOpen(false)
                      setIsCartOpen(true)
                    }}
                    className="w-full rounded-xl border border-pink-200 px-5 py-3 font-semibold text-pink-600 hover:bg-pink-50"
                  >
                    Back to Cart
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

export default App
