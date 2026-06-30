<script setup>
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { getPayables, updateStatus } from '../api';

const loading = ref(false);
const groups = ref([]);

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getPayables();
    groups.value = data.data;
  } finally {
    loading.value = false;
  }
};

const copyDetail = async (group) => {
  const content = [
    `姓名：${group.name || '未填写'}`,
    `手机号：${group.phone || '-'}`,
    `待打款总额：¥ ${Number(group.totalAmount).toFixed(2)}`,
    '订单明细：',
    ...group.orders.map(
      (item, index) =>
        `${index + 1}. ${item.product_standard} | ${item.tracking_number} | ¥ ${Number(item.amount || 0).toFixed(2)}`
    )
  ].join('\n');

  await navigator.clipboard.writeText(content);
  ElMessage.success('打款明细已复制');
};

const completeGroup = async (group) => {
  for (const item of group.orders) {
    await updateStatus({
      orderId: item.id,
      status: '已完成'
    });
  }
  ElMessage.success('该组订单已全部打款完成');
  fetchData();
};

onMounted(fetchData);
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1 class="page-title">待打款</h1>
        <div class="page-subtitle">按姓名分组汇总待打款订单，便于财务快速复制明细并完成打款。</div>
      </div>
    </div>

    <section class="panel section">
      <el-table v-loading="loading" :data="groups" stripe border>
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="140" />
        <el-table-column label="订单数" min-width="90">
          <template #default="{ row }">{{ row.orders.length }}</template>
        </el-table-column>
        <el-table-column label="待打款总额" min-width="140">
          <template #default="{ row }">¥ {{ Number(row.totalAmount || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="明细" min-width="420">
          <template #default="{ row }">
            <div v-for="item in row.orders" :key="item.id" style="margin-bottom: 6px;">
              {{ item.product_standard }} / {{ item.tracking_number }} / ¥ {{ Number(item.amount || 0).toFixed(2) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" min-width="180">
          <template #default="{ row }">
            <div class="toolbar">
              <el-button type="primary" link @click="copyDetail(row)">复制明细</el-button>
              <el-button type="success" link @click="completeGroup(row)">标记已完成</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

