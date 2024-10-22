// utils/calculations.ts

import { Product, WeekData, Order } from '../types/interfaces'

export function calculateNeed(
  products: Product[],
  weekData: WeekData,
  order: Order,
  previousOrders: Order[]
): { [productId: string]: number } {
  const needs: { [productId: string]: number } = {}

  products.forEach((product) => {
    // Calcul du stock initial
    let initialStock = 0
    if (order.real_stock && order.real_stock[product.id!]) {
      initialStock = order.real_stock[product.id!]
    } else {
      const previousOrder = previousOrders.find(
        (o) => o.order_number === order.order_number - 1
      )
      if (
        previousOrder &&
        previousOrder.ordered_quantities &&
        previousOrder.needs
      ) {
        initialStock =
          (previousOrder.ordered_quantities[product.id!] || 0) -
          (previousOrder.needs[product.id!] || 0)
      }
    }

    // Calcul de la consommation prévue
    const consumption = calculateConsumption(product, weekData, order)

    // Calcul du besoin
    const need = consumption - initialStock

    needs[product.id!] = need > 0 ? need : 0
  })

  return needs
}

function calculateConsumption(
  product: Product,
  weekData: WeekData,
  order: Order
): number {
  // Implémentez votre logique pour calculer la consommation
  return 0 // Remplacez par votre calcul réel
}
