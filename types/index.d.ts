import Vue, { PluginFunction } from 'vue';


interface ViewBaseUI extends PluginFunction<any> { }

declare const ViewBaseUI: ViewBaseUI;
export default ViewBaseUI;


export declare class VClusterizeList extends Vue { }
export declare class VMultipleSelect extends Vue { }
export declare class VTransferBox extends Vue { }