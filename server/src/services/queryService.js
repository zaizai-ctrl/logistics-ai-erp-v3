import { supabase } from '../config/supabase.js';
import { getRecentLogs } from './logService.js';
import { syncAllDerivedData } from './syncService.js';

export async function getInventoryData() {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('stock_qty', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getFinanceData() {
  let { data, error } = await supabase.from('finance_summary').select('*').eq('id', 1).maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    const synced = await syncAllDerivedData();
    data = synced.finance;
  }

  const logs = await getRecentLogs(20);

  return {
    summary: data,
    logs
  };
}

