import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../layouts/AppLayout.vue'),
      children: [
        {
          path: '/',
          component: () => import('../views/HomeView.vue'),
        },
        {
          path: '/auth',
          component: () => import('../views/AuthView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  chrome.storage.local.set({
    lastPath: to.path,
  })
  return next()
})

export default router
