// utils/excelParser.ts

import xlsx from 'xlsx'
import { Product } from '../types/interfaces'
import { saveProducts } from './dataManager'
import { File } from 'formidable'

type ExcelRow = (string | number | undefined)[]

export async function importExcelFile(file: File): Promise<void> {
  try {
    // Lire le fichier Excel à partir du chemin temporaire
    const workbook = xlsx.readFile(file.filepath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const jsonData = xlsx.utils.sheet_to_json<ExcelRow>(worksheet, { header: 1 })

    // Ignorer la première ligne (les en-têtes)
    const rows = jsonData.slice(1)

    const products: Product[] = []

    for (const row of rows as ExcelRow[]) {
      const codeDestination = row[4]?.toString() ?? '' // Colonne E (index 4)
      const referenceProduit = row[9]?.toString() ?? '' // Colonne J (index 9)
      const nomProduit = row[10]?.toString() ?? '' // Colonne K (index 10)
      const uniteStock = row[11]?.toString() ?? '' // Colonne L (index 11)
      const consommationPar1000Raw = row[40]?.toString() ?? '0' // Colonne AO (index 40)

      // Convertir la consommation par 1000 en nombre
      const consommationPar1000 = parseFloat(consommationPar1000Raw.toString().replace(',', '.')) || 0

      // Vérifier que les données essentielles sont présentes
      if (referenceProduit && nomProduit) {
        const product: Product = {
          codeDestination,
          referenceProduit,
          nomProduit,
          uniteStock,
          consommationPar1000,
    
          // Ajoutez d'autres champs si nécessaire
        }

        // Ajouter le produit à la liste
        products.push(product)
      } else {
        console.warn(
          `Produit ignoré en raison de données manquantes à la ligne ${
            rows.indexOf(row) + 2
          }`
        )
      }
    }

    // Enregistrer les produits dans la base de données
    await saveProducts(products)
  } catch (error) {
    console.error("Erreur lors de l'importation du fichier Excel :", error)
    throw error
  }
}
