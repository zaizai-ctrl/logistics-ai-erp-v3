import { supabase } from '../config/supabase.js';

export async function writeLog(action, detail) {
  await supabase.from('logs').insert({
    action,
    detail: typeof detail === 'string' ? detail : JSON.stringify(detail)
  });
}

export async function getRecentLogs(limit = 20) {
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}

