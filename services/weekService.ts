// services/weekService.ts

import { supabase } from '../utils/supabaseClient'
import { WeekData } from '../types/interfaces'

export async function getWeekData(year: number, weekNumber: number): Promise<WeekData | null> {
  const { data, error } = await supabase
    .from('weeks_data')
    .select('*')
    .eq('year', year)
    .eq('week_number', weekNumber)
    .maybeSingle(); // Utiliser maybeSingle()

  if (error) {
    console.error('Erreur lors de la récupération des données de la semaine :', error);
    throw error;
  }

  return data as WeekData | null;
}



export async function upsertWeekData(weekData: WeekData): Promise<void> {
  try {
    const { error } = await supabase
      .from('weeks_data')
      .upsert(weekData, { onConflict: 'year,week_number' })
    if (error) throw error
  } catch (error) {
    console.error("Erreur lors de la mise à jour des données de la semaine :", error)
    throw error
  }
}

export async function getConsumptionData(weekDataId: number): Promise<{ [reference_produit: string]: number }> {
  const { data, error } = await supabase
    .from('weeks_data')
    .select('consumption_data')
    .eq('id', weekDataId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Pas de données trouvées pour cette semaine
      return {};
    } else {
      console.error('Erreur lors de la récupération des données de consommation :', error);
      throw error;
    }
  }

  if (!data || !data.consumption_data) {
    return {};
  }

  return data.consumption_data;
}

export async function updateConsumptionData(
  weekDataId: number,
  consumptionData: { [reference_produit: string]: number }
): Promise<void> {
  try {
    const { error } = await supabase
      .from('weeks_data')
      .update({ consumption_data: consumptionData })
      .eq('id', weekDataId);

    if (error) {
      console.error('Erreur lors de la mise à jour des données de consommation :', error);
      throw error;
    }
  } catch (error) {
    console.error('Erreur inattendue lors de la mise à jour des données de consommation :', error);
    throw error;
  }
}