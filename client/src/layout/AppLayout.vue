<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Box,
  Cpu,
  Document,
  Goods,
  Histogram,
  Money,
  Setting
} from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const isMobile = ref(false);
const mobileMenuVisible = ref(false);

const menuItems = [
  { path: '/scan', title: '扫码入库', icon: Box },
  { path: '/ai', title: 'AI识别', icon: Cpu },
  { path: '/orders', title: '订单总表', icon: Document },
  { path: '/pay', title: '待打款', icon: Money },
  { path: '/inventory', title: '库存', icon: Goods },
  { path: '/finance', title: '财务', icon: Histogram },
  { path: '/settings', title: '商品库', icon: Setting }
];

const activeMenu = computed(() => route.path);

const updateViewport = () => {
  isMobile.value = window.innerWidth <= 860;
  if (!isMobile.value) {
    mobileMenuVisible.value = false;
  }
};

const navigate = (path) => {
  router.push(path);
  mobileMenuVisible.value = false;
};

onMounted(() => {
  updateViewport();
  window.addEventListener('resize', updateViewport);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateViewport);
});
</script>

<template>
  <div class="app-shell">
    <aside v-if="!isMobile" class="sidebar">
      <div class="brand">
        <div class="brand-title">Logistics AI ERP V3</div>
        <div class="brand-subtitle">进销存 + 财务 + AI 自动识别</div>
      </div>

      <el-menu
        :default-active="activeMenu"
        background-color="transparent"
        text-color="rgba(255,255,255,0.82)"
        active-text-color="#ffffff"
        @select="navigate"
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
          style="border-radius: 12px; margin-bottom: 6px;"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <main class="content">
      <div v-if="isMobile" class="mobile-topbar panel">
        <div>
          <div class="brand-title" style="font-size: 18px; color: var(--text-main);">Logistics AI ERP V3</div>
          <div class="brand-subtitle" style="color: var(--text-sub); margin-top: 4px;">企业级移动后台</div>
        </div>
        <el-button type="primary" @click="mobileMenuVisible = true">菜单</el-button>
      </div>
      <router-view />
    </main>
  </div>

  <el-drawer v-model="mobileMenuVisible" direction="ltr" size="280px" :with-header="false">
    <div style="padding: 8px 8px 18px;">
      <div class="brand" style="border-bottom-color: rgba(15, 23, 42, 0.08); padding-left: 6px;">
        <div class="brand-title" style="color: var(--text-main);">Logistics AI ERP V3</div>
        <div class="brand-subtitle" style="color: var(--text-sub);">手机端快捷操作入口</div>
      </div>
      <el-menu :default-active="activeMenu" @select="navigate">
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </div>
  </el-drawer>
</template>
