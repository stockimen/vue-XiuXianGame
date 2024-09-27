import map from '../views/mapExploration.vue';
import boss from '../views/bossPage.vue';
import home from '../views/homePage.vue';
import index from '../views/indexPage.vue';
import explore from '../views/explorePage.vue';
import cultivate from '../views/cultivatePage.vue';
import EndlessTower from '@/views/EndlessTower.vue'
import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        name: 'index',
        meta: {
            keepAlive: false
        },
        component: index
    },
    {
        path: '/home',
        name: 'home',
        meta: {
            keepAlive: false
        },
        component: home
    },
    {
        path: '/cultivate',
        name: 'cultivate',
        meta: {
            keepAlive: false
        },
        component: cultivate
    },
    {
        path: '/map',
        name: 'map',
        meta: {
            keepAlive: false
        },
        component: map
    },
    {
        path: '/explore',
        name: 'explore',
        meta: {
            keepAlive: false
        },
        component: explore
    },
    {
        path: '/boss',
        name: 'boss',
        meta: {
            keepAlive: false
        },
        component: boss
    },
    {
        path: '/EndlessTower ',
        name: 'EndlessTower ',
        component: EndlessTower 
    }
];
const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;
