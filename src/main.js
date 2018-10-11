import Vue from 'vue';
import vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';

import App from '@/App.vue';
import router from '@/router';

Vue.use(vuetify);
Vue.config.productionTip = false;

new Vue({
	router,
	render: h => h(App),
}).$mount('#app');
