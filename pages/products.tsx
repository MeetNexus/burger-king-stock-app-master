import { useStore } from '../stores/useStore'
import { useState } from 'react'
import { Product } from '../types/interfaces'
import UnitConversionModal from '../components/UnitConversionModal'

export default function ProductsPage() {
  const products = useStore((state) => state.products)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Gestion des Produits</h1>
      <table className="mt-4 w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Référence</th>
            <th className="border p-2">Nom</th>
            <th className="border p-2">Unité de Stock</th>
            <th className="border p-2">Consommation / 1000€</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.referenceProduit}>
              <td className="border p-2">{product.referenceProduit}</td>
              <td className="border p-2">{product.nomProduit}</td>
              <td className="border p-2">{product.uniteStock}</td>
              <td className="border p-2">{product.consommationPar1000}</td>
              <td className="border p-2">
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="text-blue-500 underline"
                >
                  Conversion des unités
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedProduct && (
        <UnitConversionModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}
