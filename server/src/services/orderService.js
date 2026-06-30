import { supabase } from '../config/supabase.js';
import { canTransition, isValidStatus } from '../utils/statusFlow.js';
import { createHttpError } from '../utils/httpError.js';
import { matchProductByAI } from './aiService.js';
import { writeLog } from './logService.js';
import { syncAllDerivedData } from './syncService.js';

function buildOrderPayload(row, matchResult, forcedStatus) {
  return {
    name: row.name || '',
    phone: row.phone || '',
    tracking_number: row.trackingNumber || row.tracking_number,
    product_raw: row.productRaw || row.product_raw || '',
    product_standard: row.product_standard || matchResult.product,
    amount: Number(row.amount ?? matchResult.amount ?? 0),
    cost: Number(row.cost ?? matchResult.cost ?? 0),
    status: forcedStatus || row.status || '已入库',
    remark: row.remark || ''
  };
}

function validateOrderInput(payload) {
  const trackingNumber = payload.trackingNumber || payload.tracking_number;
  const productRaw = payload.productRaw || payload.product_raw;

  if (!trackingNumber) {
    throw createHttpError('快递单号不能为空');
  }

  if (!productRaw) {
    throw createHttpError('商品描述不能为空');
  }
}

export async function createScanOrder(payload) {
  validateOrderInput(payload);
  const matchResult = await matchProductByAI(payload.productRaw);
  const orderPayload = buildOrderPayload(payload, matchResult, '已入库');

  const { data, error } = await supabase.from('orders').insert(orderPayload).select().single();
  if (error) {
    if (error.code === '23505') {
      throw createHttpError('快递单号已存在，不能重复入库', 409);
    }
    throw error;
  }

  await syncAllDerivedData();
  await writeLog('order.scan', {
    tracking_number: orderPayload.tracking_number,
    product_standard: orderPayload.product_standard,
    ai_source: matchResult.source
  });

  return data;
}

export async function listOrders({ keyword, status }) {
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  const filtered = keyword
    ? data.filter((item) => {
        const source = `${item.name} ${item.phone} ${item.tracking_number} ${item.product_raw} ${item.product_standard}`.toLowerCase();
        return source.includes(String(keyword).toLowerCase());
      })
    : data;

  return {
    rows: filtered,
    summary: {
      total: filtered.length
    }
  };
}

export async function updateOrderStatus({ orderId, status }) {
  if (!isValidStatus(status)) {
    throw createHttpError('非法状态值');
  }

  const { data: current, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (fetchError || !current) {
    throw createHttpError('订单不存在', 404);
  }

  if (!canTransition(current.status, status)) {
    throw createHttpError(`状态不允许从“${current.status}”直接流转到“${status}”`, 400);
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  await syncAllDerivedData();
  await writeLog('order.update_status', {
    order_id: orderId,
    from: current.status,
    to: status
  });

  return data;
}

export async function importOrders(rows) {
  const created = [];
  const errors = [];

  for (const [index, row] of rows.entries()) {
    try {
      validateOrderInput(row);
      const status = row.status && isValidStatus(row.status) ? row.status : '已入库';
      const matchResult =
        row.product_standard &&
        row.product_standard !== '' &&
        row.amount !== undefined &&
        row.amount !== '' &&
        row.cost !== undefined &&
        row.cost !== ''
          ? {
              product: row.product_standard,
              amount: Number(row.amount || 0),
              cost: Number(row.cost || 0),
              source: 'csv'
            }
          : await matchProductByAI(row.product_raw || '');

      const orderPayload = buildOrderPayload(row, matchResult, status);

      const { data, error } = await supabase.from('orders').insert(orderPayload).select().single();
      if (error) {
        throw error;
      }
      created.push(data);
    } catch (error) {
      errors.push({
        row: index + 1,
        tracking_number: row.tracking_number,
        message: error.message
      });
    }
  }

  await syncAllDerivedData();
  await writeLog('order.import_csv', {
    created: created.length,
    errors: errors.length
  });

  return {
    created: created.length,
    errors
  };
}

export async function exportOrders({ keyword, status }) {
  const { rows } = await listOrders({ keyword, status });

  return rows.map((item) => ({
    id: item.id,
    name: item.name,
    phone: item.phone,
    tracking_number: item.tracking_number,
    product_raw: item.product_raw,
    product_standard: item.product_standard,
    amount: item.amount,
    cost: item.cost,
    status: item.status,
    remark: item.remark,
    created_at: item.created_at
  }));
}

export async function listPayables() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('status', '待打款')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const map = new Map();
  for (const order of data) {
    const key = `${order.name || '未填写姓名'}__${order.phone || ''}`;
    const current = map.get(key) || {
      name: order.name || '未填写姓名',
      phone: order.phone || '',
      totalAmount: 0,
      orders: []
    };

    current.totalAmount += Number(order.amount || 0);
    current.orders.push(order);
    map.set(key, current);
  }

  return [...map.values()].sort((a, b) => b.totalAmount - a.totalAmount);
}
