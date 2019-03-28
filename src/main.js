import Vue from 'vue';
import Vuetify from 'vuetify';
import * as VueGoogleMaps from 'vue2-google-maps';

import 'vuetify/dist/vuetify.min.css';

import App from '@/App.vue';
import router from '@/router';

Vue.config.productionTip = false;

Vue.use(Vuetify);

Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyDgafZMqcjBGFyYXLu9os5SP_SWXWt27NI',
    v: '3.36',
    useBetaRenderer: true
  }
});

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app');
