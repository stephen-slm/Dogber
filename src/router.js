import Vue from 'vue';
import Router from 'vue-router';

import Home from './views/Home.vue';
import About from './views/About.vue';
import Login from './views/Login.vue';

Vue.use(Router);

const routes = [
	{
		path: '/',
		name: 'home',
		component: Home,
	},
	{
		path: '/login',
		name: 'login',
		component: Login,
	},
	{
		path: '/about',
		name: 'about',
		component: About,
	},
];

export default new Router({
	routes,
});
