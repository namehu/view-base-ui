import Vue from 'vue';
import ViewDesign from 'view-design';
import 'view-design/dist/styles/iview.css';

import router from './router';
import store from './store';
import ViewBaseUi from '../lib/index';

Vue.config.productionTip = false;

Vue.use(ViewDesign);
Vue.use(ViewBaseUi);

new Vue({
  router,
  store,
  render: (h) => h('router-view'),
}).$mount('#app');
