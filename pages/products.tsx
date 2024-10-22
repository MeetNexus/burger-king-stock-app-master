// pages/products.tsx

import { useEffect, useState } from 'react'
import { Product } from '../types/interfaces'
import UnitConversionModal from '../components/UnitConversionModal'
import { useStore } from '../stores/useStore'
import { updateProduct } from '../services/productService'
import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline'

export default function ProductsPage() {
  const products = useStore((state) => state.products)
  const fetchProducts = useStore((state) => state.fetchProducts)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Fonction pour basculer la visibilité du produit
  const toggleProductVisibility = async (product: Product) => {
    const updatedProduct = { ...product, is_hidden: !product.is_hidden }
    try {
      await updateProduct(updatedProduct)
      // Mettre à jour le store
      fetchProducts()
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit :', error)
    }
  }

  // Filtrer les produits en fonction du terme de recherche
  const filteredProducts = products.filter(
    (product) =>
      (product.nom_produit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.reference_produit.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Gestion des Produits</h1>
      {/* Barre de recherche */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-1 rounded w-full"
        />
      </div>
      <table className="mt-4 w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Référence</th>
            <th className="border p-2">Nom</th>
            <th className="border p-2">Unité de Stock</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.id}>
              <td className="border p-2">{product.reference_produit}</td>
              <td className="border p-2">{product.nom_produit}</td>
              <td className="border p-2">{product.unite_stock}</td>
              <td className="border p-2 flex items-center space-x-2">
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="text-blue-500 underline"
                >
                  Conversion des unités
                </button>
                <button onClick={() => toggleProductVisibility(product)}>
                  {product.is_hidden ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  )}
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
