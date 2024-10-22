import create from 'zustand'
import { Product } from '../types/interfaces'

interface WeekData {
  weekNumber: number
  salesForecast: Record<string, number> // Prévisions quotidiennes
  realStock: Record<string, number>
  needs: Record<string, number>
  orderedQuantities: Record<string, number>
}

interface StoreState {
  // Numéro de la semaine courante
  currentWeek: number
  setCurrentWeek: (weekNumber: number) => void

  // Données par semaine
  weeksData: Record<number, WeekData>
  setWeekData: (weekNumber: number, data: Partial<WeekData>) => void

  // Liste des produits
  products: Product[]
  setProducts: (products: Product[]) => void

  // Fonction pour calculer les besoins
  calculateNeeds: (weekNumber: number) => void

  // Autres états et actions si nécessaire
}

export const useStore = create<StoreState>((set, get) => ({
  currentWeek: getCurrentWeekNumber(),
  setCurrentWeek: (weekNumber) => set({ currentWeek: weekNumber }),

  weeksData: {},

  setWeekData: (weekNumber, data) =>
    set((state) => ({
      weeksData: {
        ...state.weeksData,
        [weekNumber]: {
          ...state.weeksData[weekNumber],
          ...data,
          weekNumber,
        },
      },
    })),

  products: [],
  setProducts: (products) => set({ products }),

  calculateNeeds: (weekNumber) => {
    const { products, weeksData } = get()
    const weekData = weeksData[weekNumber]

    if (!weekData) return

    const needs: Record<string, number> = {}

    products.forEach((product) => {
      const consommationPar1000 = product.consommationPar1000 || 0
      let totalNeed = 0

      // Calculer le besoin total en fonction des prévisions quotidiennes
      Object.values(weekData.salesForecast).forEach((dailyForecast) => {
        totalNeed += (dailyForecast / 1000) * consommationPar1000
      })

      const stock = weekData.realStock[product.referenceProduit] || 0
      totalNeed = totalNeed - stock

      if (product.unitConversion) {
        const { numberOfPacks, unitsPerPack } = product.unitConversion
        const totalUnitsPerColis = numberOfPacks * unitsPerPack

        if (totalUnitsPerColis > 0) {
          totalNeed = totalNeed / totalUnitsPerColis
        } else {
          totalNeed = 0
        }
      }

      needs[product.referenceProduit] = Math.ceil(totalNeed)
    })

    // Mettre à jour les besoins pour la semaine
    set((state) => ({
      weeksData: {
        ...state.weeksData,
        [weekNumber]: {
          ...state.weeksData[weekNumber],
          needs,
        },
      },
    }))
  },
}))

function getCurrentWeekNumber(): number {
  const today = new Date()
  const oneJan = new Date(today.getFullYear(), 0, 1)
  const numberOfDays = Math.floor(
    (today.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000)
  )
  return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7)
}
