// services/productService.ts

import { supabase } from '../utils/supabaseClient'
import { Product } from '../types/interfaces'

// Fonction pour obtenir les produits
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*')
  if (error) {
    console.error('Erreur lors de la récupération des produits :', error)
    throw error
  }
  return data as Product[]
}

// Fonction pour mettre à jour ou insérer des produits
export async function upsertProducts(products: Product[]): Promise<void> {
  const { error } = await supabase
    .from('products')
    .upsert(products, { onConflict: 'reference_produit' })
  if (error) {
    console.error('Erreur lors de la mise à jour des produits :', error)
    throw error
  }
}


export async function getProductById(id: number): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Pas de produit trouvé
      return null
    } else {
      console.error('Erreur lors de la récupération du produit :', error)
      throw error
    }
  }

  if (!data) {
    return null
  }

  return data as Product
}


export async function updateProduct(product: Product): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update(product)
    .eq('id', product.id)

  if (error) {
    console.error('Erreur lors de la mise à jour du produit :', error)
    throw error
  }
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erreur lors de la suppression du produit :', error)
    throw error
  }
}
