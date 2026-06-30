<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { createScan } from '../api';

const loading = ref(false);
const trackingRef = ref();
const lastResult = ref(null);
const form = ref({
  name: '',
  phone: '',
  trackingNumber: '',
  productRaw: '',
  remark: ''
});

const resetForm = async () => {
  form.value = {
    name: '',
    phone: '',
    trackingNumber: '',
    productRaw: '',
    remark: ''
  };
  await nextTick();
  trackingRef.value?.focus();
};

const submit = async () => {
  if (!form.value.trackingNumber || !form.value.productRaw) {
    ElMessage.warning('请先输入快递单号和商品描述');
    return;
  }

  loading.value = true;
  try {
    const { data } = await createScan(form.value);
    lastResult.value = data.data;
    ElMessage.success('入库成功，AI 已完成识别');
    await resetForm();
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  trackingRef.value?.focus();
});
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1 class="page-title">扫码入库</h1>
        <div class="page-subtitle">
          支持扫码枪键盘输入，录入单号后回车可连续操作。
        </div>
      </div>
    </div>

    <div class="grid-two">
      <section class="panel section">
        <h3 class="section-title">入库表单</h3>
        <el-form label-width="92px" @submit.prevent>
          <el-form-item label="客户姓名">
            <el-input v-model="form.name" placeholder="可选，支持后续待打款分组" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="form.phone" placeholder="可选" />
          </el-form-item>
          <el-form-item label="快递单号">
            <el-input
              ref="trackingRef"
              v-model="form.trackingNumber"
              class="scanner-input"
              placeholder="请扫码或输入唯一快递单号"
              @keyup.enter="submit"
            />
          </el-form-item>
          <el-form-item label="商品描述">
            <el-input
              v-model="form.productRaw"
              type="textarea"
              :rows="4"
              placeholder="输入原始商品描述，系统会自动调用 AI 识别标准商品、金额和成本"
            />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" placeholder="可选备注" />
          </el-form-item>
          <el-form-item>
            <div class="toolbar">
              <el-button type="primary" :loading="loading" @click="submit">提交入库</el-button>
              <el-button @click="resetForm">清空重置</el-button>
            </div>
          </el-form-item>
        </el-form>

        <div class="status-hint">
          系统逻辑：扫码入库提交后自动写入订单主表，并将状态设为“已入库”。
        </div>
      </section>

      <section class="panel section">
        <h3 class="section-title">最近识别结果</h3>
        <div v-if="lastResult" class="result-card">
          <div class="result-row">
            <span class="muted">标准商品</span>
            <strong>{{ lastResult.product_standard }}</strong>
          </div>
          <div class="result-row">
            <span class="muted">AI金额</span>
            <strong>¥ {{ Number(lastResult.amount || 0).toFixed(2) }}</strong>
          </div>
          <div class="result-row">
            <span class="muted">成本价</span>
            <strong>¥ {{ Number(lastResult.cost || 0).toFixed(2) }}</strong>
          </div>
          <div class="result-row">
            <span class="muted">订单状态</span>
            <strong>{{ lastResult.status }}</strong>
          </div>
          <div class="result-row">
            <span class="muted">快递单号</span>
            <strong>{{ lastResult.tracking_number }}</strong>
          </div>
        </div>
        <el-empty v-else description="提交首笔扫码入库后，这里会显示 AI 识别结果" />
      </section>
    </div>
  </div>
</template>

