<script setup>
import { onMounted, ref } from 'vue';
import { getFinance } from '../api';

const loading = ref(false);
const metrics = ref({
  total_purchase: 0,
  total_sales: 0,
  pending_payment: 0,
  pending_receive: 0,
  profit: 0
});
const logs = ref([]);

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getFinance();
    metrics.value = data.data.summary;
    logs.value = data.data.logs;
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
        <h1 class="page-title">财务</h1>
        <div class="page-subtitle">自动聚合总收入、总成本、待收款、待打款与利润。</div>
      </div>
    </div>

    <div class="grid-cards">
      <div class="metric-card">
        <div class="metric-label">总收入</div>
        <div class="metric-value">¥ {{ Number(metrics.total_sales || 0).toFixed(2) }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">总成本</div>
        <div class="metric-value">¥ {{ Number(metrics.total_purchase || 0).toFixed(2) }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">待收款</div>
        <div class="metric-value">¥ {{ Number(metrics.pending_receive || 0).toFixed(2) }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">待打款</div>
        <div class="metric-value">¥ {{ Number(metrics.pending_payment || 0).toFixed(2) }}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">利润</div>
        <div class="metric-value">¥ {{ Number(metrics.profit || 0).toFixed(2) }}</div>
      </div>
    </div>

    <section class="panel section" style="margin-top: 18px;">
      <h3 class="section-title">最近操作日志</h3>
      <el-table v-loading="loading" :data="logs" stripe border>
        <el-table-column prop="created_at" label="时间" min-width="180" />
        <el-table-column prop="action" label="动作" min-width="160" />
        <el-table-column prop="detail" label="详情" min-width="420" show-overflow-tooltip />
      </el-table>
    </section>
  </div>
</template>

