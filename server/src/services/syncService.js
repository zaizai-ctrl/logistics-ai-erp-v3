import { supabase } from '../config/supabase.js';
import { STATUS_FLOW } from '../utils/statusFlow.js';

const inboundStatuses = STATUS_FLOW.slice(1);
const soldStatuses = STATUS_FLOW.slice(2);
const receivedStatuses = STATUS_FLOW.slice(3);

function toNumber(value) {
  return Number(value || 0);
}

export async function fetchAllOrders() {
  const { data, error } = await supabase.from('orders').select('*');
  if (error) {
    throw error;
  }
  return data;
}

export async function syncInventory(allOrders) {
  const aggregateMap = new Map();

  for (const order of allOrders) {
    if (!inboundStatuses.includes(order.status)) {
      continue;
    }

    const product = order.product_standard || '未识别商品';
    const purchasePrice = toNumber(order.cost);
    const key = `${product}__${purchasePrice}`;
    const current = aggregateMap.get(key) || {
      product,
      purchase_price: purchasePrice,
      qty: 0,
      sold_qty: 0,
      stock_qty: 0,
      profit: 0
    };

    current.qty += 1;
    if (soldStatuses.includes(order.status)) {
      current.sold_qty += 1;
      current.profit += toNumber(order.amount) - purchasePrice;
    }
    current.stock_qty = current.qty - current.sold_qty;

    aggregateMap.set(key, current);
  }

  const inventoryRows = [...aggregateMap.values()];

  const deleteResult = await supabase.from('inventory').delete().neq('id', 0);
  if (deleteResult.error) {
    throw deleteResult.error;
  }

  if (inventoryRows.length) {
    const { error } = await supabase.from('inventory').insert(inventoryRows);
    if (error) {
      throw error;
    }
  }

  return inventoryRows;
}

export async function syncFinanceSummary(allOrders) {
  const summary = allOrders.reduce(
    (acc, order) => {
      const amount = toNumber(order.amount);
      const cost = toNumber(order.cost);

      if (inboundStatuses.includes(order.status)) {
        acc.total_purchase += cost;
      }
      if (receivedStatuses.includes(order.status)) {
        acc.total_sales += amount;
      }
      if (order.status === '待收款') {
        acc.pending_receive += amount;
      }
      if (order.status === '待打款') {
        acc.pending_payment += amount;
      }

      return acc;
    },
    {
      id: 1,
      total_purchase: 0,
      total_sales: 0,
      pending_payment: 0,
      pending_receive: 0,
      profit: 0
    }
  );

  summary.profit = summary.total_sales - summary.total_purchase;

  const { data, error } = await supabase.from('finance_summary').upsert(summary).select().single();
  if (error) {
    throw error;
  }

  return data;
}

export async function syncAllDerivedData() {
  const allOrders = await fetchAllOrders();
  const [inventory, finance] = await Promise.all([
    syncInventory(allOrders),
    syncFinanceSummary(allOrders)
  ]);

  return {
    inventory,
    finance
  };
}

