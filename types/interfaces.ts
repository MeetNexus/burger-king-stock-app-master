// types/interfaces.ts

export interface Product {
  id?: number
  reference_produit: string
  nom_produit: string
  unite_stock: string
  code_destination: string
  is_hidden: boolean
  // ... autres champs si nécessaire
}

export interface WeekData {
  id?: number
  year: number
  week_number: number
  sales_forecast?: { [date: string]: number }
  consumption_data?: { [reference_produit: string]: number } // Stocke les données de consommation
  // ... autres champs ...
}

export interface Order {
  id?: number
  week_data_id: number
  order_number: number
  delivery_date: string
  real_stock?: { [productId: number]: number }
  needs?: { [productId: number]: number }
  ordered_quantities?: { [productId: number]: number }
  // ... autres champs si nécessaire
}

export interface Category {
  id?: number
  name: string
}
// Ajoutez d'autres interfaces si nécessaire
