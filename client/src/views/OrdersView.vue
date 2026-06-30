<script setup>
import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { exportCsvUrl, getOrders, importCsv, updateStatus } from '../api';

const STATUS_FLOW = ['待入库', '已入库', '待收款', '已收款', '待打款', '已完成'];

const loading = ref(false);
const rows = ref([]);
const summary = ref({ total: 0 });
const filters = ref({
  keyword: '',
  status: ''
});

const nextStatusMap = STATUS_FLOW.reduce((acc, current, index) => {
  acc[current] = STATUS_FLOW[index + 1] || null;
  return acc;
}, {});

const statusTypeMap = {
  待入库: 'info',
  已入库: 'primary',
  待收款: 'warning',
  已收款: 'success',
  待打款: 'danger',
  已完成: 'success'
};

const exportLink = computed(() => exportCsvUrl(filters.value));

const resetFilters = () => {
  filters.value = {
    keyword: '',
    status: ''
  };
  fetchData();
};

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getOrders(filters.value);
    rows.value = data.data;
    summary.value = data.summary;
  } finally {
    loading.value = false;
  }
};

const goNext = async (row) => {
  const nextStatus = nextStatusMap[row.status];
  if (!nextStatus) {
    ElMessage.info('当前订单已完成');
    return;
  }

  await updateStatus({
    orderId: row.id,
    status: nextStatus
  });
  ElMessage.success(`状态已更新为 ${nextStatus}`);
  fetchData();
};

const handleImport = async (uploadFile) => {
  const formData = new FormData();
  formData.append('file', uploadFile.raw);
  const { data } = await importCsv(formData);
  ElMessage.success(`导入完成，成功 ${data.data.created} 条`);
  fetchData();
};

onMounted(fetchData);
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1 class="page-title">订单总表</h1>
        <div class="page-subtitle">统一承载扫码入库、AI识别、收款和打款的全流程订单数据。</div>
      </div>
      <div class="toolbar">
        <el-upload :show-file-list="false" accept=".csv" :auto-upload="false" :on-change="handleImport">
          <el-button>导入 CSV</el-button>
        </el-upload>
        <a :href="exportLink" target="_blank">
          <el-button type="primary" plain>导出 CSV</el-button>
        </a>
      </div>
    </div>

    <section class="panel section">
      <el-form inline>
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="姓名 / 单号 / 商品" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable style="width: 180px;">
            <el-option v-for="status in STATUS_FLOW" :key="status" :label="status" :value="status" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <div class="toolbar">
            <el-button type="primary" @click="fetchData">查询</el-button>
            <el-button @click="resetFilters">重置</el-button>
          </div>
        </el-form-item>
      </el-form>
    </section>

    <section class="panel section" style="margin-top: 18px;">
      <div class="toolbar" style="justify-content: space-between; margin-bottom: 16px;">
        <div class="muted">共 {{ summary.total }} 条订单</div>
      </div>
      <el-table v-loading="loading" :data="rows" stripe border>
        <el-table-column prop="created_at" label="创建时间" min-width="170" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column prop="tracking_number" label="快递单号" min-width="170" />
        <el-table-column prop="product_raw" label="原始商品" min-width="220" show-overflow-tooltip />
        <el-table-column prop="product_standard" label="标准商品" min-width="160" />
        <el-table-column label="金额" min-width="100">
          <template #default="{ row }">¥ {{ Number(row.amount || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="成本" min-width="100">
          <template #default="{ row }">¥ {{ Number(row.cost || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="110">
          <template #default="{ row }">
            <el-tag :type="statusTypeMap[row.status] || 'info'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
        <el-table-column label="操作" fixed="right" min-width="130">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              :disabled="!nextStatusMap[row.status]"
              @click="goNext(row)"
            >
              推进到{{ nextStatusMap[row.status] || '已完成' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>
