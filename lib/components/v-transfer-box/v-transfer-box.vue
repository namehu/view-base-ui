<style lang="scss" scoped>
@import './style.scss';
</style>

<template>
  <div class="vb-transfer-box">
    <div class="source-card ">
      <!-- 左侧头 -->
      <div class="header">
        <Checkbox v-model="selectAllLeft"
          :disabled="disabledAllLeft"
          :indeterminate="indeterminateLeft"
          @on-change="onSelectLeftAllChange"><span class="checkbox-text">{{titles[0] || '待选框'}}</span></Checkbox>
        <span>{{leftSelectedLength ? `${leftSelectedLength} / ` : ''}}{{unSelectedList.length ? unSelectedList.length : ''}}</span>
      </div>
      <!-- 左侧搜索 -->
      <div v-if="localFilter"
        class="search-input">
        <Input v-model="leftFilterName"
          suffix="ios-search"
          :placeholder="leftFilterPlaceholder"></Input>
      </div>
      <!-- 左侧选项框 -->
      <div :class="['content', localFilter ? 'filter-content' : '']">
        <ClusterizeList v-show="!showRemote && unSelectedList.length"
          :data="unSelectedList"
          :key="dataKey"
          @on-change="onLeftCheckboxChange"></ClusterizeList>
        <div v-if="localFilter && !showRemote && !unSelectedList.length"
          class="message-wrapper">
          <span class="no-data-message">
            <Icon type="md-document" />无数据
          </span>
        </div>
        <div v-show="showRemote"
          class="message-wrapper">
          <span class="remote-message">
            <Icon type="ios-search"></Icon>正在搜索...
          </span>
        </div>
      </div>
    </div>
    <div class="action-button">
      <!-- 额外的操作框 -->
      <slot name="extraAction"></slot>
      <Button icon="ios-arrow-forward"
        type="primary"
        :disabled="overMax || !leftSelectedLength"
        @click="moveToSelected">移至已选</Button>
      <Button icon="ios-arrow-back"
        type="primary"
        :disabled="!rightSelectedLength"
        @click="moveToUnselected">移至待选</Button>
      <div v-if="max"
        class="tip">{{maxTip || `上限${max}项`}}</div>
    </div>
    <div class="target-card">
      <!-- 右侧头 -->
      <div class="header">
        <Checkbox v-model="selectAllRight"
          :disabled="disabledAllRight"
          :indeterminate="indeterminateRight"
          @on-change="onSelectRightAllChange"><span class="checkbox-text">{{titles[1] || '已选框'}}</span></Checkbox>
        <span>{{rightSelectedLength ? `${rightSelectedLength} / ` : ''}}<span :style="{'color': overMax ? '#ed4014': '' }">{{selectedList.length ? selectedList.length : ''}}</span></span>
      </div>
      <!-- 右侧搜索 -->
      <div v-if="localFilter"
        class="search-input">
        <Input v-model="rightFilterName"
          suffix="ios-search"
          :placeholder="rightFilterPlaceholder"
          @on-change="onRightSearchChange"></Input>
      </div>
      <!-- 右侧筛选框 -->
      <div :class="['content', localFilter ? 'filter-content' : '']">
        <!-- <ul>
        <li v-for="(item, index) in selectedList"
          :key="index">
          <Checkbox v-model="item._checked"
            :disabled="item.disabled"
            @on-change="onRightCheckboxChange">
            <span v-html="renderLabel(item)"
              class="checkbox-text"></span>
          </Checkbox>
        </li>
      </ul> -->
        <ClusterizeList :data="selectedList"
          :key="dataKey"
          @on-change="onRightCheckboxChange"></ClusterizeList>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import ClusterizeList from './v-clusterize-list';
import { Checkbox } from 'view-design';

@Component({
  name: 'VTransferBox',
  components: { Checkbox, ClusterizeList },
})
export default class VTransferBox extends Vue {
  @Prop({ type: Array, default: () => [] }) public data!: any[]; // 穿梭框数据
  @Prop({ type: Array, default: () => [] }) public targetKeys!: string[]; // 已选的keys
  @Prop({ type: String, default: 'key' }) public dataKey!: string; // 穿梭框索引key值。唯一值
  @Prop({ type: Array, default: () => [] }) public titles!: string[]; // 标题
  @Prop({ type: Function }) public renderFormat!: (data: any) => string; // 格式化名称
  @Prop({ type: Boolean, default: false }) public filter!: boolean; // 是否开启搜索
  @Prop({ type: Boolean, default: false }) public remote!: boolean; // 是否开启远程搜索
  @Prop({ type: Number, default: 0 }) public remoteLen!: number; // 需要输入几个字符触发远程搜索
  @Prop({ type: Function }) public remoteMethod!: (
    name: string,
  ) => Promise<any>; // 远程搜索方法，返回一个promise。
  @Prop({ type: [String, Array], default: '请输入内容搜索' })
  public filterPlaceholder!: string; // 搜索框placeholder
  @Prop({ type: Number, default: 0 }) public max!: number; // 最大人数
  @Prop({ type: String, default: '' }) public maxTip!: string; // 最大上限提示

  public transferList: TransferList[] = []; // 组件内部数据
  public leftFilterName = ''; // 左侧模糊搜索名称
  public rightFilterName = ''; // 右侧模糊搜索名称
  public selectAllLeft = false; // 左侧全选
  public selectAllRight = false; // 右侧全选
  public showRemote = false; // 是否显示正在远程搜索
  private remoteTimeout = 0;

  public get leftFilterPlaceholder() {
    return typeof this.filterPlaceholder === 'string'
      ? this.filterPlaceholder
      : this.filterPlaceholder[0];
  }

  public get rightFilterPlaceholder() {
    return typeof this.filterPlaceholder === 'string'
      ? this.filterPlaceholder
      : this.filterPlaceholder[1];
  }
  public get S_T_K() {
    return this.targetKeys.join(',');
  }
  // 待选并匹配搜索的用户信息
  public get unSelectedList() {
    return this.transferList.filter(v => this.isMatchUnSelected(v));
  }

  // 待选并且未被禁用的list
  public get unSelectedAndNoDisabledList() {
    return this.unSelectedList.filter(v => this.notDisabled(v));
  }

  // 已经移入已选并匹配搜索的用户信息
  public get selectedList() {
    return this.transferList.filter(v => this.isMatchSelected(v));
  }

  // 已选并且未被禁用的list
  public get selectedAndNoDisabledList() {
    return this.selectedList.filter(v => this.notDisabled(v));
  }

  public get indeterminateLeft() {
    const len = this.unSelectedList.filter(v => v._checked).length;
    return len > 0 && len < this.unSelectedAndNoDisabledList.length;
  }

  public get indeterminateRight() {
    const len = this.selectedList.filter(v => v._checked).length;
    return len > 0 && len < this.selectedAndNoDisabledList.length;
  }

  public get leftSelectedLength() {
    return this.unSelectedList.filter(v => v._checked).length;
  }

  public get rightSelectedLength() {
    return this.selectedList.filter(v => v._checked).length;
  }

  public get localFilter() {
    return this.filter || this.remote;
  }

  // 是否超出最大上限
  public get overMax() {
    return !!this.max && this.targetKeys.length >= this.max;
  }

  public get disabledAllLeft() {
    return this.unSelectedList.every(v => v._disabled || v.disabled);
  }

  public get disabledAllRight() {
    return this.selectedList.every(v => v.disabled);
  }

  /**
   * 根据外部list来设置本地List数据。
   * 设置唯一key、设置是否选择
   * @readonly
   */
  @Watch('data')
  public dataHandler(data: any) {
    if (data && data.length) {
      this.transferList = data.map((v: any, i: number) => {
        const keyValue = v[this.dataKey] || `key-${i}`;

        // tslint:disable-next-line:variable-name
        let _disabled = false;
        if (this.overMax) {
          _disabled = this.isMatchUnSelected(v);
        }

        return {
          label: this.renderLabel(v),
          [this.dataKey]: keyValue,
          disabled: v.disabled,
          _checked: false,
          _disabled,
        };
      });
    }
  }

  @Watch('leftFilterName')
  public leftFilterNameHandler(value: string = '') {
    this.$emit('on-filter-change', { type: 1, value });
    if (this.selectAllLeft) {
      this.selectAllLeft = false;
    }
    this.onSelectLeftAllChange(false); // 手动置空已经选中的选项

    // 是否执行远程搜索
    if (this.remote) {
      if (!this.remoteMethod) {
        return this.$Message.warning('未定义remoteMethod');
      }

      // 判断是否超出了远程搜索长度
      if (value.length < this.remoteLen) {
        return;
      }

      this.showRemote = true;

      // 延迟触发远程搜索
      if (this.remoteTimeout) {
        clearTimeout(this.remoteTimeout);
      }
      this.remoteTimeout = window.setTimeout(() => {
        this.remoteMethod(value)
          .then(() => {
            this.showRemote = false;
            this.$emit('on-remote-success');
            this.$emit('on-remote-finish');
          })
          .catch(() => {
            this.showRemote = false;
            this.$emit('on-remote-failed');
            this.$emit('on-remote-finish');
          });
      }, 300);
    } else {
      this.$nextTick(() => {
        this.isOverMax();
      });
    }
  }

  /**
   * 点击左侧全选
   *
   * @param {boolean} value
   */
  public onSelectLeftAllChange(value: boolean) {
    // const keys = this.unSelectedList.map(v => v[this.dataKey]);

    const unSelectListLen = this.unSelectedList.length;
    const selectListLen = this.targetKeys.length;

    // 如果是全选并且设置最大值且当前超过最大值范围， 则只能选到最大值
    if (this.max && value && unSelectListLen + selectListLen >= this.max) {
      let count = this.max - selectListLen;

      const leftUnCheckes = this.unSelectedList.filter(v => !v._checked); // 左侧未选

      count = count - (unSelectListLen - leftUnCheckes.length);

      leftUnCheckes.forEach((v, i) => {
        if (!v.disabled) {
          if (count > 0) {
            count--;
            v._checked = true;
          } else {
            v._disabled = true;
          }
        }
      });
    } else {
      this.unSelectedList.forEach(v => {
        if (!v.disabled) {
          v._checked = value;
        }
      });
    }

    this.isOverMax();
  }

  /**
   * 监听左侧待选框的变化
   *
   * @param {boolean} value
   * @returns
   */
  public onLeftCheckboxChange(value: boolean) {
    this.isOverMax();
    // 判断是否全选
    if (!value) {
      this.selectAllLeft = false;
    } else if (this.unSelectedAndNoDisabledList.every(v => v._checked)) {
      // 判断未选中且未禁用的列表是否都选中了
      this.selectAllLeft = true;
    }
  }

  /**
   * 移到已选
   *
   */
  public moveToSelected() {
    this.selectAllLeft = false;
    const moveKeys: string[] = [];
    this.unSelectedList.forEach(v => {
      if (v._checked) {
        moveKeys.push(v[this.dataKey]);
        this.$set(v, '_checked', false);
      }
    });

    this.$emit('on-change', this.targetKeys.concat(moveKeys));
  }

  /**
   * 移到待选
   *
   */
  public moveToUnselected() {
    this.selectAllRight = false;
    const removedKeys: string[] = [];
    this.selectedList.forEach(v => {
      if (v._checked) {
        removedKeys.push(v[this.dataKey]);
        this.$set(v, '_checked', false);
      }
    });
    const unRemovedKeys = this.targetKeys.filter(v => !removedKeys.includes(v));
    this.$emit('on-change', unRemovedKeys);

    this.$nextTick(() => {
      this.isOverMax(); // 判断是否超出最大限制
    });
  }

  /**
   * 点击右侧全选
   *
   * @param {boolean} value
   */
  public onSelectRightAllChange(value: boolean) {
    this.selectedList.forEach(v => {
      if (!value) {
        v._checked = false;
      } else if (this.notDisabled(v)) {
        v._checked = true;
      }
    });
  }

  /**
   * 右侧搜索change事件
   *
   */
  public onRightSearchChange(value: string = '') {
    this.$emit('on-filter-change', { type: 2, value });
    if (this.selectAllRight) {
      this.selectAllRight = false;
    }
    this.onSelectRightAllChange(false); // 手动置空已经选中的选项
  }

  /**
   * 右侧多选框切换事件
   *
   * @param {boolean} value
   */
  public onRightCheckboxChange(value: boolean) {
    if (value) {
      const len = this.selectedList.filter(v => v._checked && !v.disabled)
        .length;
      if (len === this.selectedList.filter(v => !v.disabled).length) {
        this.selectAllRight = value;
      }
    } else {
      this.selectAllRight = value;
    }
  }

  /**
   * 渲染label
   *
   * @param {*} data
   * @returns {string}
   */
  public renderLabel(data: any): string {
    return this.renderFormat ? this.renderFormat(data) : data.label || '';
  }

  /**
   * 判断是否超出最大,并操作是否禁用左侧栏
   *
   * @private
   */
  private isOverMax() {
    if (this.max) {
      const selectedLen = this.targetKeys.length + this.leftSelectedLength;
      // 超出最大值
      if (selectedLen >= this.max) {
        this.unSelectedList.forEach(v => {
          if (!v._checked) {
            v._disabled = true;
          }
        });
      } else {
        // 没有超过最大值的话。则将内部_disabled设置为false
        this.unSelectedList.forEach(v => {
          v._disabled = false;
        });
      }
    }
  }

  /**
   * 匹配选中的数据
   *
   * @description targetKeys中包括并且匹配搜索名
   * @private
   * @param {TransferList} data
   * @returns
   */
  private isMatchSelected(data: TransferList) {
    return (
      this.S_T_K.indexOf(data[this.dataKey]) !== -1 &&
      data.label.indexOf(this.rightFilterName) !== -1
    );
  }

  /**
   * 匹配未选中的数据
   *
   * @description targetKeys中不包括并且匹配搜索名
   * @private
   * @param {TransferList} data
   * @returns
   */
  private isMatchUnSelected(data: TransferList) {
    return (
      this.S_T_K.indexOf(data[this.dataKey]) === -1 &&
      data.label.indexOf(this.leftFilterName) !== -1
    );
  }

  // 判断未禁用
  private notDisabled({ disabled, _disabled }: TransferList) {
    return !disabled && !_disabled;
  }
}

interface TransferList {
  label: string;
  key?: string;
  _checked: boolean; // 是否选中
  _disabled: boolean; // 是否禁用
  disabled?: boolean; // 外部数据禁用
  [i: string]: any;
}
</script>