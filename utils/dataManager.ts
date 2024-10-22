// utils/dataManager.ts

import { Low, JSONFile } from 'lowdb'
import { Product } from '../types/interfaces'
import path from 'path'

type Data = {
  products: Product[]
}

const filePath = path.join(process.cwd(), 'data', 'db.json')
const adapter = new JSONFile<Data>(filePath)
const db = new Low<Data>(adapter)

// Fonction pour enregistrer les produits
export async function saveProducts(products: Product[]) {
  await db.read()
  db.data ||= { products: [] }

  // Fusionner les produits existants avec les nouveaux
  for (const product of products) {
    const existingIndex = db.data.products.findIndex(
      (p) => p.referenceProduit === product.referenceProduit
    )
    if (existingIndex !== -1) {
      // Mettre à jour le produit existant
      db.data.products[existingIndex] = {
        ...db.data.products[existingIndex],
        ...product,
      }
    } else {
      // Ajouter le nouveau produit
      db.data.products.push(product)
    }
  }

  await db.write()
}

// Fonction pour obtenir tous les produits
export async function getProducts(): Promise<Product[]> {
  await db.read()
  db.data ||= { products: [] }
  return db.data.products
}
