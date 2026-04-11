import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import Contacts from '../pages/Contacts.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/contacts', component: Contacts },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
});

export default router;
