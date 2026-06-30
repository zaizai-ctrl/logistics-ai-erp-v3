<script setup>
import { ref } from 'vue';
import { aiMatch } from '../api';

const loading = ref(false);
const text = ref('');
const result = ref(null);

const submit = async () => {
  if (!text.value) {
    return;
  }

  loading.value = true;
  try {
    const { data } = await aiMatch({ text: text.value });
    result.value = data.data;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1 class="page-title">AI识别</h1>
        <div class="page-subtitle">输入原始商品描述，实时查看 AI 返回的标准商品与金额。</div>
      </div>
    </div>

    <div class="grid-two">
      <section class="panel section">
        <h3 class="section-title">识别输入</h3>
        <el-input
          v-model="text"
          type="textarea"
          :rows="10"
          placeholder="例如：苹果手表S9 45毫米 午夜色 铝金属 GPS 款"
        />
        <div class="toolbar" style="margin-top: 16px;">
          <el-button type="primary" :loading="loading" @click="submit">调用 AI</el-button>
          <el-button @click="text = ''; result = null;">清空</el-button>
        </div>
      </section>

      <section class="panel section">
        <h3 class="section-title">识别结果</h3>
        <div v-if="result" class="result-card">
          <div class="result-row">
            <span class="muted">标准商品</span>
            <strong>{{ result.product }}</strong>
          </div>
          <div class="result-row">
            <span class="muted">建议回款</span>
            <strong>¥ {{ Number(result.amount || 0).toFixed(2) }}</strong>
          </div>
          <div class="result-row">
            <span class="muted">建议成本</span>
            <strong>¥ {{ Number(result.cost || 0).toFixed(2) }}</strong>
          </div>
        </div>
        <el-empty v-else description="还没有识别结果" />
      </section>
    </div>
  </div>
</template>

