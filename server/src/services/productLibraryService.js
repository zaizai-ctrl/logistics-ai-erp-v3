import { supabase } from '../config/supabase.js';
import { createHttpError } from '../utils/httpError.js';
import { writeLog } from './logService.js';

export async function listProductLibrary() {
  const { data, error } = await supabase
    .from('product_library')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function createProductRule(payload) {
  const { data, error } = await supabase
    .from('product_library')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await writeLog('product_library.create', payload);
  return data;
}

export async function updateProductRule(id, payload) {
  const { data, error } = await supabase
    .from('product_library')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw createHttpError('商品规则不存在', 404);
  }

  await writeLog('product_library.update', { id, ...payload });
  return data;
}

export async function deleteProductRule(id) {
  const { data, error } = await supabase
    .from('product_library')
    .delete()
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw createHttpError('商品规则不存在', 404);
  }

  await writeLog('product_library.delete', { id });
  return data;
}

export function findLibraryMatch(text, library) {
  const source = String(text || '').toLowerCase();
  for (const item of library) {
    const keywords = String(item.keyword || '')
      .split(',')
      .map((keyword) => keyword.trim().toLowerCase())
      .filter(Boolean);

    if (keywords.some((keyword) => source.includes(keyword))) {
      return {
        product: item.product_name,
        amount: Number(item.default_amount || 0),
        cost: Number(item.cost_price || 0)
      };
    }
  }

  return null;
}

