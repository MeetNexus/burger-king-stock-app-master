// types/interfaces.ts

/**
 * Interface représentant un produit.
 */
export interface UnitConversion {
  numberOfPacks: number
  unitsPerPack: number
  unit: string
}

export interface Product {
    codeDestination: string
    referenceProduit: string
    nomProduit: string
    uniteStock: string
    consommationPar1000: number
    unitConversion?: UnitConversion
    // Vous pouvez ajouter d'autres propriétés si nécessaire
  }
  