// utils/excelParser.ts

import * as xlsx from 'xlsx';
import { WeekData, Product } from '../types/interfaces';
import { upsertWeekData } from '../services/weekService';
import { upsertProducts } from '../services/productService'; // Si vous avez un service pour gérer les produits
// import { saveProducts } from './dataManager'; // Si vous utilisez toujours dataManager.ts

type ExcelRow = any[];

// Fonction pour importer les données de consommation depuis un fichier Excel
export async function importConsumptionDataFromExcel(file: File, weekData: WeekData): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = xlsx.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json<ExcelRow>(worksheet, { header: 1 });

        // Ignorer la première ligne (les en-têtes)
        const rows = jsonData.slice(1);

        const consumptionData: { [reference_produit: string]: number } = {};
        const products: Product[] = [];

        for (const row of rows) {
          const codeDestination = row[4]?.toString() ?? ''; // Colonne E (index 4)
          const referenceProduit = row[9]?.toString() ?? ''; // Colonne J (index 9)
          const nomProduit = row[10]?.toString() ?? ''; // Colonne K (index 10)
          const uniteStock = row[11]?.toString() ?? ''; // Colonne L (index 11)
          const consommationPar1000Raw = row[40]?.toString() ?? '0'; // Colonne AO (index 40)

          // Convertir la consommation par 1000 en nombre
          const consommationPar1000 = parseFloat(consommationPar1000Raw.replace(',', '.')) || 0;

          // Vérifier que la référence produit est présente
          if (referenceProduit) {
            // Stocker la consommation par 1000 pour chaque produit
            consumptionData[referenceProduit] = consommationPar1000;

            // Créer un objet produit
            const product: Product = {
              reference_produit: referenceProduit,
              nom_produit: nomProduit,
              code_destination: codeDestination,
              unite_stock: uniteStock,
              is_hidden: false, // Par défaut
            };

            products.push(product);
          } else {
            console.warn(
              `Donnée ignorée en raison de référence produit manquante à la ligne ${
                rows.indexOf(row) + 2
              }`
            );
          }
        }

        // Mettre à jour weekData avec consumption_data
        const updatedWeekData = { ...weekData, consumption_data: consumptionData };
        await upsertWeekData(updatedWeekData);

        // Enregistrer ou mettre à jour les produits
        await upsertProducts(products); // Si vous utilisez productService.ts
        // await saveProducts(products); // Si vous utilisez dataManager.ts

        resolve();
      };

      reader.onerror = (error) => {
        console.error('Erreur lors de la lecture du fichier Excel :', error);
        reject(error);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Erreur lors de l'importation du fichier Excel :", error);
      reject(error);
    }
  });
}
