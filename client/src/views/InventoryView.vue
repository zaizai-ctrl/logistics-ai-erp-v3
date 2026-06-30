<script setup>
import { onMounted, ref } from 'vue';
import { getInventory } from '../api';

const loading = ref(false);
const rows = ref([]);

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getInventory();
    rows.value = data.data;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1 class="page-title">库存</h1>
        <div class="page-subtitle">系统根据订单状态实时重算库存、已售数量和产品利润。</div>
      </div>
    </div>

    <section class="panel section">
      <el-table v-loading="loading" :data="rows" stripe border>
        <el-table-column prop="product" label="商品" min-width="220" />
        <el-table-column label="采购价" min-width="110">
          <template #default="{ row }">¥ {{ Number(row.purchase_price || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="qty" label="入库数量" min-width="100" />
        <el-table-column prop="sold_qty" label="已售数量" min-width="100" />
        <el-table-column prop="stock_qty" label="当前库存" min-width="100" />
        <el-table-column label="利润" min-width="110">
          <template #default="{ row }">¥ {{ Number(row.profit || 0).toFixed(2) }}</template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

