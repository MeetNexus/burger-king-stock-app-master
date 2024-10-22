import { useStore } from '../stores/useStore'
import { useEffect } from 'react'
import { startOfWeek, addDays, format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import Card from '../components/Card'
import { useMemo } from 'react';
//import Button from '../components/Button'
//import { FiPlusCircle } from 'react-icons/fi'

export default function OrdersPage() {
  const products = useStore((state) => state.products)
  const currentWeek = useStore((state) => state.currentWeek)
  const setCurrentWeek = useStore((state) => state.setCurrentWeek)
  const weeksData = useStore((state) => state.weeksData)
  const setWeekData = useStore((state) => state.setWeekData)
  const calculateNeeds = useStore((state) => state.calculateNeeds)

  const weekDates = getDatesOfWeek(currentWeek)

  useEffect(() => {
    // Initialiser les données de la semaine si elles n'existent pas
    if (!weeksData[currentWeek]) {
      setWeekData(currentWeek, {
        salesForecast: {},
        realStock: {},
        needs: {},
        orderedQuantities: {},
      })
    }
  }, [currentWeek, setWeekData, weeksData])

  const currentSalesForecast = useMemo(() => weeksData[currentWeek]?.salesForecast, [weeksData, currentWeek]);

  useEffect(() => {
    calculateNeeds(currentWeek)
  }, [calculateNeeds, currentWeek, currentSalesForecast])

  const handleSalesForecastChange = (date: string, value: number) => {
    const salesForecast = {
      ...weeksData[currentWeek]?.salesForecast,
      [date]: value,
    }
    setWeekData(currentWeek, { salesForecast })
  }

  const handleStockChange = (referenceProduit: string, value: number) => {
    const realStock = {
      ...weeksData[currentWeek]?.realStock,
      [referenceProduit]: value,
    }
    setWeekData(currentWeek, { realStock })
  }

  const handleOrderedQuantityChange = (referenceProduit: string, value: number) => {
    const orderedQuantities = {
      ...weeksData[currentWeek]?.orderedQuantities,
      [referenceProduit]: value,
    }
    setWeekData(currentWeek, { orderedQuantities })
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-center">Gestion des Commandes</h1>
        <div>
          <label className="mr-2 font-semibold">Semaine :</label>
          <select
            value={currentWeek}
            onChange={(e) => setCurrentWeek(Number(e.target.value))}
            className="border p-1 rounded"
          >
            {Array.from({ length: 52 }, (_, i) => i + 1).map((week) => (
              <option key={week} value={week}>
                Semaine {week}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Card className="mt-4">
        <h2 className="text-lg text-center text-bk-brown font-bold">
          Prévisions de Chiffre d&apos;Affaires
        </h2>
        <table className="mt-2 w-full border-collapse bg-white">
          <thead>
            <tr>
              <th className="border p-1 text-base font-semibold bg-bk-yellow text-bk-brown">Date</th>
              <th className="border p-1 text-base font-semibold bg-bk-yellow text-bk-brown">Prévision (€)</th>
            </tr>
          </thead>
          <tbody>
            {weekDates.map(({ date, dayName }) => (
              <tr key={date} className="odd:bg-gray-50">
                <td className="border p-1 text-bk-brown text-sm font-semibold">
                  {dayName} {format(parseISO(date), 'dd/MM/yyyy', { locale: fr })}
                </td>
                <td className="border p-1 text-sm text-bk-brown">
                  <input
                    type="number"
                    value={weeksData[currentWeek]?.salesForecast?.[date] || ''}
                    onChange={(e) =>
                      handleSalesForecastChange(date, Number(e.target.value))
                    }
                    className="w-full border p-1 rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="flex mt-8 space-x-4">
        {['Lundi', 'Mercredi', 'Vendredi'].map((commande, index) => (
          <Card key={index} className="w-1/3">
            <h2 className="text-lg font-bold text-bk-brown text-center">
              {commande}
            </h2>
            <table className="mt-4 w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-1 font-semibold text-sm bg-bk-yellow text-bk-brown w-1/2">Produit</th>
                  <th className="border p-1 font-semibold text-sm bg-bk-yellow text-bk-brown w-1/6">Stock</th>
                  <th className="border p-1 font-semibold text-sm bg-bk-yellow text-bk-brown w-1/6">Besoin</th>
                  <th className="border p-1 font-semibold text-sm bg-bk-yellow text-bk-brown w-1/6">Quantité</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                //{products.map((product, idx) => {
                  const weekData = weeksData[currentWeek] || {}
                  const realStock = weekData.realStock || {}
                  const needs = weekData.needs || {}
                  const orderedQuantities = weekData.orderedQuantities || {}

                  return (
                    <tr
                      key={product.referenceProduit}
                      className="bg-white odd:bg-gray-50"
                    >
                      <td className="border p-1 text-xs">{product.nomProduit}</td>
                      <td className="border p-1 text-center text-xs">
                        <input
                          type="number"
                          value={realStock[product.referenceProduit] || ''}
                          onChange={(e) =>
                            handleStockChange(
                              product.referenceProduit,
                              Number(e.target.value)
                            )
                          }
                          className="w-full border p-1 rounded"
                        />
                      </td>
                      <td className="border p-1 text-center text-xs">
                        {needs[product.referenceProduit]?.toFixed(0) || 0}
                      </td>
                      <td className="border p-1 text-center text-xs">
                        <input
                          type="number"
                          value={orderedQuantities[product.referenceProduit] || ''}
                          onChange={(e) =>
                            handleOrderedQuantityChange(
                              product.referenceProduit,
                              Number(e.target.value)
                            )
                          }
                          className="w-full border p-1 rounded"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Fonction pour obtenir les dates de la semaine courante
function getDatesOfWeek(weekNumber: number): { date: string; dayName: string }[] {
    const firstDayOfYear = new Date(new Date().getFullYear(), 0, 1)
    const daysOffset = (weekNumber - 1) * 7
    const weekStart = addDays(firstDayOfYear, daysOffset)
    const weekStartDate = startOfWeek(weekStart, { weekStartsOn: 1 }) // La semaine commence le lundi
  
    return Array.from({ length: 7 }, (_, i) => {
      const dateObj = addDays(weekStartDate, i)
      return {
        date: format(dateObj, 'yyyy-MM-dd'),
        dayName: format(dateObj, 'EEEE', { locale: fr }),
      }
    })
  }
