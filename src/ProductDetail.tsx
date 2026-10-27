
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

  function money(amount: number) {
    return `₱${amount.toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
        className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-pink-100 bg-white text-slate-800 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-pink-100 bg-white/95 p-4 backdrop-blur sm:p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-pink-600">
              {product.category}
            </p>
            <h2
              id="product-detail-title"
              className="mt-1 text-xl font-black text-pink-700 sm:text-2xl"
            >
              Product Details
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-pink-200 text-xl font-bold text-pink-700 hover:bg-pink-50"
          >
            ×
          </button>
        </div>

        <div className="grid gap-5 p-4 sm:grid-cols-2 sm:gap-8 sm:p-6">
          <div className="overflow-hidden rounded-xl bg-pink-50">
            <img
              src={product.image}
              alt={product.name}
              className="max-h-80 min-h-56 w-full object-contain sm:max-h-[480px]"
              onError={(event) => {
                event.currentTarget.onerror = null
                event.currentTarget.src =
                  'https://placehold.co/600x400/fce7f3/9d174d?text=Product'
              }}
            />
          </div>

          <div className="min-w-0">
            <h3 className="text-2xl font-black text-slate-900">
              {product.name}
            </h3>

            <p className="mt-3 text-2xl font-black text-pink-700">
              {money(product.price)}
            </p>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              {product.description}
            </p>

            <div className="mt-5 rounded-xl bg-pink-50 p-4">
              <h4 className="font-bold text-pink-700">
                Specifications
              </h4>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
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

            <div className="mt-5">
              <label className="text-sm font-bold">
                Select Quantity
              </label>

              <div className="mt-2 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
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
                {money(totalPrice)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onAddToCart(product.id, quantity)
                onClose()
              }}
              disabled={!canAddToCart}
              className="mt-5 w-full rounded-xl bg-pink-600 px-4 py-3 font-bold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {availableStock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProductDetail
