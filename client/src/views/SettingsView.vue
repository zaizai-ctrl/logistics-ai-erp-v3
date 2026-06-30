<script setup>
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  createProductLibrary,
  deleteProductLibrary,
  getProductLibrary,
  updateProductLibrary
} from '../api';

const loading = ref(false);
const visible = ref(false);
const editingId = ref(null);
const rows = ref([]);
const form = ref({
  keyword: '',
  product_name: '',
  default_amount: 0,
  cost_price: 0
});

const resetForm = () => {
  editingId.value = null;
  form.value = {
    keyword: '',
    product_name: '',
    default_amount: 0,
    cost_price: 0
  };
};

const openCreate = () => {
  resetForm();
  visible.value = true;
};

const openEdit = (row) => {
  editingId.value = row.id;
  form.value = {
    keyword: row.keyword,
    product_name: row.product_name,
    default_amount: Number(row.default_amount || 0),
    cost_price: Number(row.cost_price || 0)
  };
  visible.value = true;
};

const fetchData = async () => {
  loading.value = true;
  try {
    const { data } = await getProductLibrary();
    rows.value = data.data;
  } finally {
    loading.value = false;
  }
};

const submit = async () => {
  if (editingId.value) {
    await updateProductLibrary(editingId.value, form.value);
    ElMessage.success('商品库已更新');
  } else {
    await createProductLibrary(form.value);
    ElMessage.success('商品库已新增');
  }
  visible.value = false;
  fetchData();
};

const removeRow = async (row) => {
  await ElMessageBox.confirm(`确认删除商品“${row.product_name}”吗？`, '提示', {
    type: 'warning'
  });
  await deleteProductLibrary(row.id);
  ElMessage.success('已删除');
  fetchData();
};

onMounted(fetchData);
</script>

<template>
  <div>
    <div class="page-head">
      <div>
        <h1 class="page-title">商品库</h1>
        <div class="page-subtitle">维护 AI 匹配关键词、默认金额和成本价，提升识别稳定性。</div>
      </div>
      <div class="toolbar">
        <el-button type="primary" @click="openCreate">新增商品规则</el-button>
      </div>
    </div>

    <section class="panel section">
      <el-table v-loading="loading" :data="rows" stripe border>
        <el-table-column prop="keyword" label="关键词" min-width="240" show-overflow-tooltip />
        <el-table-column prop="product_name" label="标准商品名" min-width="180" />
        <el-table-column label="默认金额" min-width="110">
          <template #default="{ row }">¥ {{ Number(row.default_amount || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="成本价" min-width="110">
          <template #default="{ row }">¥ {{ Number(row.cost_price || 0).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" min-width="140">
          <template #default="{ row }">
            <div class="toolbar">
              <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
              <el-button type="danger" link @click="removeRow(row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog
      v-model="visible"
      :title="editingId ? '编辑商品规则' : '新增商品规则'"
      width="580px"
      @closed="resetForm"
    >
      <el-form label-width="100px">
        <el-form-item label="关键词">
          <el-input
            v-model="form.keyword"
            type="textarea"
            :rows="3"
            placeholder="多个关键词用逗号分隔，例如：苹果手表,watch,s9"
          />
        </el-form-item>
        <el-form-item label="标准商品">
          <el-input v-model="form.product_name" />
        </el-form-item>
        <el-form-item label="默认金额">
          <el-input-number v-model="form.default_amount" :min="0" :precision="2" class="full-width" />
        </el-form-item>
        <el-form-item label="成本价">
          <el-input-number v-model="form.cost_price" :min="0" :precision="2" class="full-width" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="toolbar" style="justify-content: flex-end;">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="submit">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

