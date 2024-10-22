import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { importExcelFile } from '../../utils/excelParser'

export const config = {
  api: {
    bodyParser: false, // Désactiver le bodyParser intégré pour pouvoir utiliser formidable
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const form = formidable({ multiples: false })

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err)
        res.status(500).json({ message: 'Erreur lors du traitement du fichier.' })
        return
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file

        if (!file) {
        res.status(400).json({ message: 'Aucun fichier fourni.' })
        return
        }

        try {
        await importExcelFile(file)
        res.status(200).json({ message: 'Importation réussie.' })
        } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erreur lors de l'importation du fichier." })
        }
    })
  } else {
    res.status(405).json({ message: 'Méthode non autorisée.' })
  }
}