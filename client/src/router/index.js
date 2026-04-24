import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { getMe } from '@/api/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '数据看板' }
      },
      {
        path: 'orders',
        name: 'OrderList',
        component: () => import('@/views/OrderList.vue'),
        meta: { title: '工单管理' }
      },
      {
        path: 'orders/create',
        name: 'OrderCreate',
        component: () => import('@/views/OrderCreate.vue'),
        meta: { title: '新建工单', adminOnly: true }
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('@/views/OrderDetail.vue'),
        meta: { title: '工单详情' }
      },
      {
        path: 'technicians',
        name: 'TechnicianList',
        component: () => import('@/views/TechnicianList.vue'),
        meta: { title: '技师管理', adminOnly: true }
      },
      {
        path: 'customers',
        name: 'CustomerList',
        component: () => import('@/views/CustomerList.vue'),
        meta: { title: '客户管理', adminOnly: true }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // 公开页面直接放行
  if (to.meta.public) {
    if (userStore.isLoggedIn) {
      return next('/dashboard');
    }
    return next();
  }

  // 未登录跳转登录页
  if (!userStore.isLoggedIn) {
    return next('/login');
  }

  // 尝试获取用户信息（如果还没有）
  if (!userStore.user) {
    try {
      const res = await getMe();
      userStore.setUser(res.data);
    } catch {
      userStore.clearUser();
      return next('/login');
    }
  }

  // admin 专属页面拦截
  if (to.meta.adminOnly && !userStore.isAdmin) {
    return next('/dashboard');
  }

  next();
});

export default router;
