// pages/import.tsx

import { useState } from 'react'
import { useStore } from '../stores/useStore'

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState<string>('')
  const setProducts = useStore((state) => state.setProducts)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (file) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch('/api/importExcel', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()

        if (res.ok) {
          setMessage('Importation réussie.')

          // Récupérer les produits depuis le serveur
          const productsRes = await fetch('/api/products')
          const products = await productsRes.json()
          setProducts(products)
        } else {
          setMessage(data.message || "Erreur lors de l'importation du fichier.")
        }
      } catch (error) {
        console.error(error)
        setMessage("Erreur lors de l'importation du fichier.")
      }
    } else {
      setMessage('Veuillez sélectionner un fichier.')
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Importation du Fichier Excel</h1>
      <div className="mt-4">
        <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
        <button
          onClick={handleImport}
          className="ml-2 px-4 py-2 bg-bk-yellow text-bk-brown rounded"
        >
          Importer
        </button>
      </div>
      {message && <p className="mt-4">{message}</p>}
    </div>
  )
}
