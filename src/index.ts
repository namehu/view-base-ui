import VMultipleSelect from './components/v-multiple-select';
import VTransferBox from './components/v-transfer-box';
import VClusterizeList from './components/v-transfer-box/v-clusterize-list';

const components: any = {
  VClusterizeList,
  VMultipleSelect,
  VTransferBox,
}

export {
  VClusterizeList,
  VMultipleSelect,
  VTransferBox,
}

export default {
  install(Vue: any) {
    Object.keys(components).forEach(key => {
      Vue.component(key, components[key])
    })
  }
}