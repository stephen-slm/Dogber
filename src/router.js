import Vue from 'vue';
import Router from 'vue-router';

import WalkFinder from '@/views/WalkFinder.vue';
import FourOFour from '@/views/FourOFour.vue';
import Settings from '@/views/Settings.vue';
import Profile from '@/views/Profile.vue';
import SignOut from '@/views/SignOut.vue';
import Login from '@/views/Login.vue';
import Walks from '@/views/Walks.vue';
import Home from '@/views/Home.vue';

Vue.use(Router);

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/profile/:id',
    name: 'profile',
    component: Profile
  },
  {
    path: '/me/walks',
    name: 'walks',
    component: Walks
  },
  {
    path: '/walks',
    name: 'walkfinder',
    component: WalkFinder
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings
  },
  {
    path: '/signout',
    name: 'signout',
    component: SignOut
  },
  {
    path: '*',
    name: 'fourofour',
    component: FourOFour
  }
];

export default new Router({
  mode: 'history',
  routes
});
