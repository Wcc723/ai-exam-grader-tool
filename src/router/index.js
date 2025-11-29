import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SetupView from '../views/SetupView.vue';
import { storage } from '../utils/storage';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/grading'
    },
    {
      path: '/setup',
      name: 'setup',
      component: SetupView
    },
    {
      path: '/grading',
      name: 'grading',
      component: HomeView,
      meta: { requiresAuth: true }
    }
  ]
});

router.beforeEach((to, from, next) => {
  const hasApiKey = !!storage.getGeminiApiKey();

  if (to.meta.requiresAuth && !hasApiKey) {
    next('/setup');
  } else {
    next();
  }
});

export default router;
