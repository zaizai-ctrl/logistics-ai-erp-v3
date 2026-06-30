import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '../layout/AppLayout.vue';

const ScanView = () => import('../views/ScanView.vue');
const AIView = () => import('../views/AIView.vue');
const OrdersView = () => import('../views/OrdersView.vue');
const PayView = () => import('../views/PayView.vue');
const InventoryView = () => import('../views/InventoryView.vue');
const FinanceView = () => import('../views/FinanceView.vue');
const SettingsView = () => import('../views/SettingsView.vue');

const routes = [
  {
    path: '/',
    component: AppLayout,
    redirect: '/scan',
    children: [
      { path: '/scan', component: ScanView, meta: { title: '扫码入库' } },
      { path: '/ai', component: AIView, meta: { title: 'AI识别' } },
      { path: '/orders', component: OrdersView, meta: { title: '订单总表' } },
      { path: '/pay', component: PayView, meta: { title: '待打款' } },
      { path: '/inventory', component: InventoryView, meta: { title: '库存' } },
      { path: '/finance', component: FinanceView, meta: { title: '财务' } },
      { path: '/settings', component: SettingsView, meta: { title: '商品库' } }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.afterEach((to) => {
  document.title = `Logistics AI ERP V3 - ${to.meta?.title || '系统后台'}`;
});

export default router;
