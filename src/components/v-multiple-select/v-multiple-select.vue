<style lang="scss" scoped>
@import './style';
</style>

<template>
  <div :class="multipleSelectClass">
    <div class="select-selection"
      @click="toogleVisible">
      <div class="selection-content">
        <span v-if="value.length"
          class="selection-selected-label">{{selectedValues.map(v => v.label).join(',')}}</span>
        <span class="selection-placeholder"
          v-else>{{placeholder}}</span>
      </div>
      <Icon type="ios-arrow-down"
        class="select-arrow"></Icon>
    </div>
    <transition name="slide-up">
      <div v-show="visible"
        class="select-dropdown"
        @click.stop>
        <div class="select-operation">
          <div v-show="filter"
            class="search-input">
            <Input v-model="searchText"
              size="small"
              placeholder="输入搜索"
              class="input"
              @on-change="onSearchChange"></Input>
          </div>
          <div class="operation">
            <Checkbox :value="allSelected"
              :indeterminate="allIndeterminate"
              :disabled="!filterOptions.length"
              @on-change="onSelectedAllChange">全选</Checkbox>
            <span v-show="inverse"
              class="inverse"
              @click="onClickInverse">反选</span>
            <Checkbox v-if="showSelect"
              v-model="onlySelected"
              class="select-filter"
              :disabled="!localOptions.length"
              @on-change="onOnlySelectedChange">只看已选</Checkbox>
            <span class="option-len">
              {{value.length}}/{{options.length}}
            </span>
            </span>
          </div>
        </div>
        <div class="select-dropdown-list">
          <ul v-if="filterOptions.length">
            <li v-for="(item, index) in filterOptions"
              :key="index">
              <Checkbox v-model="item.checked"
                @on-change="onOptionItemCheckChange">{{item.label}}</Checkbox>
            </li>
          </ul>
          <div v-else
            class="no-data">没有数据</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component({ name: 'VMultipleSelect' })
export default class VMultipleSelect extends Vue {
  @Prop({ type: Array, default: () => [] }) public value!: Array<
    string | number
  >; // 传入的选定值
  @Prop({ type: Array, default: () => [] })
  public options!: MultiSelectOption[]; // 传入的下拉选项
  @Prop({ type: String, default: '请选择' }) public placeholder!: string;
  @Prop({ type: Boolean, default: false }) public inverse!: boolean; // 是否开启反选
  @Prop({ type: Boolean, default: false }) public filter!: boolean; // 是否开启搜索
  @Prop({ type: Boolean, default: false }) public showSelect!: boolean; // 是否开启只看已选

  public searchText = '';
  public onlySelected = false;
  public localOptions: LMultiSelectOption[] = [];
  public visible = false;

  @Watch('options', { immediate: true })
  public optionsHandler(v: MultiSelectOption[]) {
    this.localOptions = v.map(option => {
      const checked = this.value.indexOf(option.value) !== -1;
      return { ...option, checked };
    });
  }

  @Watch('value', { deep: true })
  public valueHandler() {
    this.localOptions = this.options.map(option => {
      const checked = this.value.indexOf(option.value) !== -1;
      return { ...option, checked };
    });
  }

  public get multipleSelectClass() {
    return {
      'vb-multiple-select': true,
      'select-visible': this.visible,
    };
  }

  public get multipleSelectDropDownClass() {
    return {
      'select-dropdown': true,
    };
  }

  public get allSelected() {
    return (
      this.filterOptions.filter(v => v.checked).length ===
      this.filterOptions.length
    );
  }

  public get allIndeterminate() {
    const ol = this.filterOptions.length;
    return (
      !!ol && this.filterSelectOptionLen > 0 && this.filterSelectOptionLen < ol
    );
  }

  public get filterSelectOptionLen() {
    return this.filterOptions.filter(v => v.checked).length;
  }

  public get filterOptions() {
    let o = this.localOptions;
    if (this.searchText) {
      o = o.filter(v => v.label.indexOf(this.searchText) !== -1);
    }
    if (this.onlySelected) {
      o = o.filter(v => v.checked);
    }
    return o;
  }

  public get selectedValues() {
    return this.options.filter(v => this.value.includes(v.value));
  }

  public mounted() {
    document.body.addEventListener('click', this.clickHandler);
  }

  public beforeDestroy() {
    document.body.removeEventListener('click', this.clickHandler);
  }

  public toogleVisible() {
    this.visible = !this.visible;
  }

  public onSearchChange(v: string) {}

  public onOnlySelectedChange(v: boolean) {}

  public onClickInverse() {
    if (!this.filterOptions.length) {
      return;
    }
    this.filterOptions.forEach(o => {
      this.$set(o, 'checked', !o.checked);
    });
    this.emitChange();
  }

  /**
   * 全选CheckBox变化处理
   *
   * @param {boolean} v
   */
  public onSelectedAllChange(v: boolean) {
    this.filterOptions.forEach(o => {
      this.$set(o, 'checked', v);
    });
    // this.$forceUpdate();
    this.emitChange();
  }

  /**
   * 点击选项
   *
   * @param {boolean} checked
   */
  public onOptionItemCheckChange(checked: boolean) {
    this.emitChange();
  }

  private clickHandler(e: Event) {
    if (this.$el.contains(e.target as any)) {
      return;
    }
    if (this.visible) {
      this.visible = !this.visible;
    }
  }

  private emitChange() {
    const selectedValues = this.localOptions
      .filter(v => v.checked)
      .map(v => v.value);
    this.$emit('input', selectedValues);
    this.$emit('on-change', selectedValues);
  }
}

interface MultiSelectOption {
  label: string;
  value: string | number;
  [i: string]: any;
}

interface LMultiSelectOption extends MultiSelectOption {
  checked: boolean;
}
</script>

