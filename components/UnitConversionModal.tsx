// components/UnitConversionModal.tsx

import { useState } from 'react'
import { useStore } from '../stores/useStore'
import { Product } from '../types/interfaces'

interface UnitConversionModalProps {
  product: Product
  onClose: () => void
}

export default function UnitConversionModal({
  product,
  onClose,
}: UnitConversionModalProps) {
  const [numberOfPacks, setNumberOfPacks] = useState<number>(
    product.unit_conversion?.number_of_packs || 0
  )
  const [unitsPerPack, setUnitsPerPack] = useState<number>(
    product.unit_conversion?.units_per_pack || 0
  )
  const setProducts = useStore((state) => state.setProducts)
  const products = useStore((state) => state.products)

  const handleSave = () => {
    const updatedProduct: Product = {
      ...product,
      unit_conversion: {
        number_of_packs: numberOfPacks,
        units_per_pack: unitsPerPack,
        unit: product.unite_stock, // 'unite_stock' correspond à votre interface
      },
    }
    const updatedProducts = products.map((p) =>
      p.reference_produit === product.reference_produit ? updatedProduct : p
    )
    setProducts(updatedProducts)
    onClose()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">
          Conversion des unités pour {product.nom_produit}
        </h2>
        <div className="mb-4">
          <label className="block mb-1">Nombre de sachets dans le colis :</label>
          <input
            type="number"
            value={numberOfPacks}
            onChange={(e) => setNumberOfPacks(Number(e.target.value))}
            className="w-full border p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Nombre d&apos;unités par sachet :</label>
          <input
            type="number"
            value={unitsPerPack}
            onChange={(e) => setUnitsPerPack(Number(e.target.value))}
            className="w-full border p-2"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
          >
            Enregistrer
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}
