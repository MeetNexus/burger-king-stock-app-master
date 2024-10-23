// pages/orders.tsx

import { useEffect, useState } from 'react'
import {
  startOfWeek,
  addDays,
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  getISOWeek,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import Card from '../components/Card'
import { getWeekData, upsertWeekData } from '../services/weekService'
import { getOrdersForWeek, upsertOrder } from '../services/orderService'
import { getProducts } from '../services/productService'
import { WeekData, Order, Product } from '../types/interfaces'
import { importConsumptionDataFromExcel } from '../utils/excelParser'
import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline'

export default function OrdersPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1)
  const [currentWeek, setCurrentWeek] = useState<number>(getCurrentWeekNumber())
  const [weekData, setWeekData] = useState<WeekData | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const [hiddenProducts, setHiddenProducts] = useState<number[]>([])
  const [hiddenCards, setHiddenCards] = useState<number[]>([])

  // Obtenir les semaines du mois sélectionné
  const weeksInMonth = getWeeksInMonth(currentYear, currentMonth)

  const weekDates = getDatesOfWeek(currentYear, currentWeek)

  useEffect(() => {
    // Charger les produits
    async function fetchProducts() {
      try {
        const productsData = await getProducts()
        setProducts(productsData)
      } catch (error) {
        console.error('Erreur lors du chargement des produits :', error)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    async function fetchWeekDataAndOrders() {
      try {
        let data = await getWeekData(currentYear, currentWeek);
        let weekDataId: number | undefined;
  
        if (!data) {
          // Créer les données de la semaine si elles n'existent pas
          const newWeekData: WeekData = {
            year: currentYear,
            week_number: currentWeek,
            sales_forecast: {},
            consumption_data: {},
          };
          await upsertWeekData(newWeekData);
          data = await getWeekData(currentYear, currentWeek);
        }
  
        if (data) {
          setWeekData(data);
          weekDataId = data.id;
        } else {
          console.error('Impossible de créer ou de récupérer les données de la semaine.');
          return;
        }
  
        // Créer les commandes si elles n'existent pas
        if (weekDataId) {
          const deliveryDates = getDeliveryDates(currentYear, currentWeek);
          const existingOrders = await getOrdersForWeek(weekDataId);
  
          if (existingOrders.length === 0) {
            const newOrders: Order[] = deliveryDates.map((deliveryDate, index) => ({
              week_data_id: weekDataId!,
              order_number: index + 1,
              delivery_date: deliveryDate,
            }));
            const createdOrders = await Promise.all(newOrders.map((order) => upsertOrder(order)));
            setOrders(createdOrders);
          } else {
            // Trier les commandes par numéro
            existingOrders.sort((a, b) => a.order_number - b.order_number);
            setOrders(existingOrders);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données de la semaine :', error);
      }
    }
    if (currentWeek) {
      fetchWeekDataAndOrders();
    }
  }, [currentYear, currentWeek]);
  

  const handleSalesForecastChange = async (date: string, value: number) => {
    if (weekData) {
      const sales_forecast = {
        ...weekData.sales_forecast,
        [date]: value,
      }
      const updatedWeekData = { ...weekData, sales_forecast }
      try {
        await upsertWeekData(updatedWeekData)
        setWeekData(updatedWeekData)
        // Mettre à jour les besoins pour chaque commande
        orders.forEach(updateOrderNeeds)
      } catch (error) {
        console.error('Erreur lors de la mise à jour des prévisions de ventes :', error)
      }
    }
  }

  const handleStockChange = async (orderId: number, productId: number, value: number) => {
    const order = orders.find((o) => o.id === orderId)
    if (order) {
      const realStock = {
        ...order.real_stock,
        [productId]: value,
      }
      const updatedOrder = { ...order, real_stock: realStock }
      try {
        await upsertOrder(updatedOrder)
        setOrders((prevOrders) => prevOrders.map((o) => (o.id === orderId ? updatedOrder : o)))
      } catch (error) {
        console.error('Erreur lors de la mise à jour du stock réel :', error)
      }
    }
  }

  const handleOrderedQuantityChange = async (
    orderId: number,
    productId: number,
    value: number
  ) => {
    const order = orders.find((o) => o.id === orderId)
    if (order) {
      const orderedQuantities = {
        ...order.ordered_quantities,
        [productId]: value,
      }
      const updatedOrder = { ...order, ordered_quantities: orderedQuantities }
      try {
        await upsertOrder(updatedOrder)
        setOrders((prevOrders) => prevOrders.map((o) => (o.id === orderId ? updatedOrder : o)))
      } catch (error) {
        console.error('Erreur lors de la mise à jour des quantités commandées :', error)
      }
    }
  }

  // Gestion de l'importation du fichier Excel
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (file && weekData) {
      try {
        await importConsumptionDataFromExcel(file, weekData)
        setMessage('Importation réussie.')
        // Recharger weekData après l'importation
        const updatedWeekData = await getWeekData(currentYear, currentWeek)
        setWeekData(updatedWeekData)
        // Mettre à jour les besoins pour chaque commande
        orders.forEach(updateOrderNeeds)
      } catch (error) {
        console.error(error)
        setMessage("Erreur lors de l'importation du fichier.")
      }
    } else {
      setMessage('Veuillez sélectionner un fichier.')
    }
  }

  // Fonction de masquage des produits sur orders.tsx
  const toggleOrderProductVisibility = (productId: number) => {
    setHiddenProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  // Fonction pour masquer les cards (commandes)
  const toggleCardVisibility = (orderId: number) => {
    setHiddenCards((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    )
  }

  // Filtrage des produits en fonction du terme de recherche
  const filteredProducts = products.filter(
    (product) =>
      (product.nom_produit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.reference_produit.toLowerCase().includes(searchTerm.toLowerCase())) &&
      !hiddenProducts.includes(product.id!) &&
      !product.is_hidden
  )

  // Fonction pour calculer les besoins pour une commande spécifique
  const calculateNeeds = (order: Order) => {
    const needs: { [productId: number]: number } = {}

    if (!weekData || !weekData.consumption_data) {
      return needs
    }

    products.forEach((product) => {
      // Récupérer la consommation par 1000€ pour le produit à partir de weekData.consumption_data
      const consommationPar1000 = weekData.consumption_data?.[product.reference_produit] || 0

      // Calculer le besoin basé sur les prévisions de ventes
      let totalSalesForecast = 0

      if (weekData.sales_forecast) {
        // Additionner les prévisions de ventes jusqu'à la date de livraison de la commande
        for (const [date, forecast] of Object.entries(weekData.sales_forecast)) {
          if (new Date(date) <= new Date(order.delivery_date)) {
            totalSalesForecast += forecast
          }
        }
      }

      // Calcul du besoin
      const besoin = (consommationPar1000 / 1000) * totalSalesForecast

      needs[product.id!] = besoin
    })

    return needs
  }

  // Mettre à jour les besoins pour une commande spécifique
  const updateOrderNeeds = async (order: Order) => {
    const needs = calculateNeeds(order)
    const updatedOrder = { ...order, needs }
    try {
      await upsertOrder(updatedOrder)
      setOrders((prevOrders) => prevOrders.map((o) => (o.id === order.id ? updatedOrder : o)))
    } catch (error) {
      console.error('Erreur lors de la mise à jour des besoins :', error)
    }
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-center">Gestion des Commandes</h1>
        <div className="flex space-x-2 items-center">
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="border p-1 rounded"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(
              (year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            )}
          </select>
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(Number(e.target.value))}
            className="border p-1 rounded"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {format(new Date(0, month - 1), 'MMMM', { locale: fr })}
              </option>
            ))}
          </select>
          <select
            value={currentWeek}
            onChange={(e) => setCurrentWeek(Number(e.target.value))}
            className="border p-1 rounded"
          >
            {weeksInMonth.map((week) => (
              <option key={week} value={week}>
                Semaine {week}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-bold">Importation des Données de Consommation</h2>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
        <button
          onClick={handleImport}
          className="ml-2 px-4 py-2 bg-bk-yellow text-bk-brown rounded"
        >
          Importer
        </button>
        {message && <p className="mt-2 text-red-500">{message}</p>}
      </div>

      <Card className="mt-4">
        <h2 className="text-lg text-center text-bk-brown font-bold">
          Prévisions de Chiffre d&apos;Affaires
        </h2>
        <table className="mt-2 w-full border-collapse bg-white">
          <thead>
            <tr>
              <th className="border p-1 text-base font-semibold bg-bk-yellow text-bk-brown">
                Date
              </th>
              <th className="border p-1 text-base font-semibold bg-bk-yellow text-bk-brown">
                Prévision (€)
              </th>
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
                    value={weekData?.sales_forecast?.[date] || ''}
                    onChange={(e) => handleSalesForecastChange(date, Number(e.target.value))}
                    className="w-full border p-1 rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

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

      <div className="flex mt-8 space-x-4">
        {orders
          .filter((order) => !hiddenCards.includes(order.id!))
          .map((order) => (
            <Card key={order.id} className="w-1/3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-bk-brown text-center">
                  Commande {order.order_number}
                </h2>
                <button onClick={() => toggleCardVisibility(order.id!)}>
                  {hiddenCards.includes(order.id!) ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
              <p className="text-center text-sm">
                Date de livraison :{' '}
                {format(parseISO(order.delivery_date), 'EEEE dd/MM/yyyy', { locale: fr })}
              </p>
              <table className="mt-4 w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-1 font-semibold text-sm bg-bk-yellow text-bk-brown w-1/2">
                      Produit
                    </th>
                    <th className="border p-1 font-semibold text-sm bg-bk-yellow text-bk-brown w-1/6">
                      Stock
                    </th>
                    <th className="border p-1 font-semibold text-sm bg-bk-yellow text-bk-brown w-1/6">
                      Besoin
                    </th>
                    <th className="border p-1 font-semibold text-sm bg-bk-yellow text-bk-brown w-1/6">
                      Quantité
                    </th>
                    <th className="border p-1 font-semibold text-sm bg-bk-yellow text-bk-brown w-1/6">
                      {/* Bouton œil */}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const realStock = order.real_stock || {}
                    const needs = order.needs || {}
                    const orderedQuantities = order.ordered_quantities || {}

                    return (
                      <tr key={product.id} className="bg-white odd:bg-gray-50">
                        <td className="border p-1 text-xs">{product.nom_produit}</td>
                        <td className="border p-1 text-center text-xs">
                          <input
                            type="number"
                            value={realStock[product.id!] || ''}
                            onChange={(e) =>
                              handleStockChange(order.id!, product.id!, Number(e.target.value))
                            }
                            className="w-full border p-1 rounded"
                          />
                        </td>
                        <td className="border p-1 text-center text-xs">
                          {needs[product.id!]?.toFixed(0) || 0}
                        </td>
                        <td className="border p-1 text-center text-xs">
                          <input
                            type="number"
                            value={orderedQuantities[product.id!] || ''}
                            onChange={(e) =>
                              handleOrderedQuantityChange(
                                order.id!,
                                product.id!,
                                Number(e.target.value)
                              )
                            }
                            className="w-full border p-1 rounded"
                          />
                        </td>
                        <td className="border p-1 text-center text-xs">
                          <button onClick={() => toggleOrderProductVisibility(product.id!)}>
                            {hiddenProducts.includes(product.id!) ? (
                              <EyeOffIcon className="h-5 w-5 text-gray-500" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-500" />
                            )}
                          </button>
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

// Fonctions utilitaires

function getCurrentWeekNumber(): number {
  const currentDate = new Date()
  const oneJan = new Date(currentDate.getFullYear(), 0, 1)
  const numberOfDays = Math.floor(
    (currentDate.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000)
  )
  return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7)
}

function getWeeksInMonth(year: number, month: number): number[] {
  const firstDay = startOfMonth(new Date(year, month - 1))
  const lastDay = endOfMonth(new Date(year, month - 1))
  const weeks = new Set<number>()

  let date = firstDay
  while (date <= lastDay) {
    weeks.add(getISOWeek(date))
    date = addDays(date, 1)
  }

  return Array.from(weeks).sort((a, b) => a - b)
}

function getDatesOfWeek(year: number, weekNumber: number): { date: string; dayName: string }[] {
  const firstDayOfYear = new Date(year, 0, 1)
  const weekStart = addDays(firstDayOfYear, (weekNumber - 1) * 7)
  const weekStartDate = startOfWeek(weekStart, { weekStartsOn: 1 })

  return Array.from({ length: 7 }, (_, i) => {
    const dateObj = addDays(weekStartDate, i)
    return {
      date: format(dateObj, 'yyyy-MM-dd'),
      dayName: format(dateObj, 'EEEE', { locale: fr }),
    }
  })
}

function getDeliveryDates(year: number, weekNumber: number): string[] {
  const weekDates = getDatesOfWeek(year, weekNumber)
  const nextWeekDates = getDatesOfWeek(year, weekNumber + 1)

  const deliveryDates = [
    // Jeudi de la semaine courante
    weekDates.find((dateObj) => dateObj.dayName.toLowerCase() === 'jeudi')?.date,
    // Samedi de la semaine courante
    weekDates.find((dateObj) => dateObj.dayName.toLowerCase() === 'samedi')?.date,
    // Mardi de la semaine suivante
    nextWeekDates.find((dateObj) => dateObj.dayName.toLowerCase() === 'mardi')?.date,
  ]

  return deliveryDates.filter(Boolean) as string[]
}
