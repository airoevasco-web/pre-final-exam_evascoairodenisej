
import { useState } from 'react'
import type { Product } from './types'

interface ProductDetailProps {
  product: Product
  onClose: () => void
  onAddToCart: (id: number, quantity: number) => void
}

function ProductDetail({
  product,
  onClose,
  onAddToCart,
}: ProductDetailProps) {
  const availableStock = Math.max(
    0,
    product.quantity - (product.cartQuantity ?? 0),
  )

  const [quantity, setQuantity] = useState(1)

  const totalPrice = product.price * quantity
  const canAddToCart =
    availableStock > 0 && quantity <= availableStock

  return (
    <main className="min-h-screen bg-pink-50 px-5 py-8 text-slate-800">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={onClose}
          className="mb-6 rounded-lg border border-pink-300 bg-white px-4 py-2 font-semibold text-pink-700 hover:bg-pink-100"
        >
          ← Back to Products
        </button>

        <section className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-lg">
          <div className="border-b border-pink-100 p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-pink-600">
              {product.category}
            </p>

            <h1 className="mt-2 text-3xl font-black text-pink-700">
              Product Details
            </h1>
          </div>

          <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-8">
            <div className="overflow-hidden rounded-xl bg-pink-50">
              <img
                src={product.image}
                alt={product.name}
                className="h-72 w-full object-cover sm:h-full sm:min-h-96"
                onError={(event) => {
                  event.currentTarget.src =
                    'https://placehold.co/600x400/fce7f3/9d174d?text=Product'
                }}
              />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">
                {product.name}
              </h2>

              <p className="mt-3 text-2xl font-black text-pink-700">
                ₱
                {product.price.toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                {product.description}
              </p>

              <div className="mt-5 rounded-xl bg-pink-50 p-4">
                <h3 className="font-bold text-pink-700">
                  Specifications
                </h3>
                <p className="mt-2 text-sm leading-6">
                  {product.specification}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-600">
                  Available stock:
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    availableStock === 0
                      ? 'bg-red-100 text-red-700'
                      : availableStock < 5
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-green-100 text-green-700'
                  }`}
                >
                  {availableStock === 0
                    ? 'Out of Stock'
                    : availableStock < 5
                      ? `Low Stock: ${availableStock}`
                      : `In Stock: ${availableStock}`}
                </span>
              </div>

              <div className="mt-6">
                <label className="text-sm font-bold">
                  Select Quantity
                </label>

                <div className="mt-2 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) =>
                        Math.max(1, current - 1),
                      )
                    }
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="h-10 w-10 rounded-lg border border-pink-300 text-xl font-bold disabled:opacity-40"
                  >
                    −
                  </button>

                  <span
                    aria-live="polite"
                    className="min-w-8 text-center text-lg font-black"
                  >
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) =>
                        Math.min(availableStock, current + 1),
                      )
                    }
                    disabled={quantity >= availableStock}
                    aria-label="Increase quantity"
                    className="h-10 w-10 rounded-lg border border-pink-300 text-xl font-bold disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-pink-200 bg-pink-50 p-4">
                <p className="text-sm text-slate-600">
                  Total Price ({quantity}{' '}
                  {quantity === 1 ? 'item' : 'items'})
                </p>

                <p
                  aria-live="polite"
                  className="mt-1 text-2xl font-black text-pink-700"
                >
                  ₱
                  {totalPrice.toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onAddToCart(product.id, quantity)
                  onClose()
                }}
                disabled={!canAddToCart}
                className="mt-5 w-full rounded-lg bg-pink-600 px-4 py-3 font-bold text-white hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {availableStock === 0
                  ? 'Out of Stock'
                  : 'Add to Cart'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default ProductDetail
