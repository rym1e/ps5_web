import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Reservation',
    component: () => import('../pages/ReservationPage.vue')
  },
  {
    path: '/pay/:orderId',
    name: 'Pay',
    component: () => import('../pages/PayPage.vue'),
    props: true
  },
  {
    path: '/orders',
    name: 'Orders',
    component: () => import('../pages/OrdersPage.vue')
  },
  {
    path: '/orders/:orderId',
    name: 'OrderDetail',
    component: () => import('../pages/OrderDetailPage.vue'),
    props: true
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/NotFoundPage.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
