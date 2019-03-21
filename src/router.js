import Vue from 'vue';
import Router from 'vue-router';

import Introduction from '@/views/Introduction.vue';
import WalkFinder from '@/views/WalkFinder.vue';
import FourOFour from '@/views/FourOFour.vue';
import Settings from '@/views/Settings.vue';
import Profile from '@/views/Profile.vue';
import SignOut from '@/views/SignOut.vue';
import Login from '@/views/Login.vue';
import Walks from '@/views/Walks.vue';
import Home from '@/views/Home.vue';
import Walk from '@/views/Walk.vue';

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
    path: '/walks/:id',
    name: 'singlewalk',
    component: Walk
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
    path: '/introduction',
    name: 'introduction',
    component: Introduction
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
