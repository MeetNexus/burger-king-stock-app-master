// services/orderService.ts

import { supabase } from '../utils/supabaseClient'
import { Order } from '../types/interfaces'

export async function getOrdersForWeek(weekDataId: number): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('week_data_id', weekDataId)

  if (error) {
    console.error('Erreur lors de la récupération des commandes :', error)
    throw error
  }

  return data as Order[]
}

export async function getOrder(
  weekDataId: number,
  orderNumber: number
): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('week_data_id', weekDataId)
    .eq('order_number', orderNumber)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Pas de commande trouvée
      return null
    } else {
      console.error('Erreur lors de la récupération de la commande :', error)
      throw error
    }
  }

  if (!data) {
    return null
  }

  return data as Order
}

export async function upsertOrder(order: Order): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .upsert(order, {
      onConflict: 'week_data_id,order_number',
      // Supprimer 'returning' ici
    })
    .select() // Enchaîner avec .select() pour obtenir les données
    .single(); // Utiliser .single() pour obtenir un seul enregistrement

  if (error) {
    console.error('Erreur lors de la mise à jour de la commande :', error);
    throw error;
  }

  return data as Order;
}

export async function deleteOrder(weekDataId: number, orderNumber: number): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('week_data_id', weekDataId)
    .eq('order_number', orderNumber)

  if (error) {
    console.error('Erreur lors de la suppression de la commande :', error)
    throw error
  }
}
