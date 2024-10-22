// pages/api/products.ts

import { NextApiRequest, NextApiResponse } from 'next'
import { getProducts } from '../../utils/dataManager'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const products = await getProducts()
      res.status(200).json(products)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Erreur lors de la récupération des produits.' })
    }
  } else {
    res.status(405).json({ message: 'Méthode non autorisée.' })
  }
}
