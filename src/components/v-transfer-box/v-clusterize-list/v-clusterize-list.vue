<style scoped lang="scss">
@import './style.scss';
</style>

<template>
  <ul class="vb-clusterize-list">
    <li :style="{'height': `${firstHeight}px`}"
      class="clusterize-list-li-first"></li>
    <li v-for="(item, index) in renderList"
      :key="item[dataKey]">
      <Checkbox v-model="item._checked"
        :disabled="item.disabled || item._disabled"
        @on-change="$emit('on-change', $event)">
        <span class="checkbox-text">{{item.label}}</span>
      </Checkbox>
    </li>
    <li :style="{'height': `${lastHeight}px`}"
      class="clusterize-list-li-last"></li>
  </ul>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { on, off } from '../../../utils';

@require('./clusterize-list.render.html?style=./clusterize-list.scss')
@Component({ name: 'VClusterizeList' })
export default class VClusterizeList extends Vue {
  @Prop({ type: Array, default: () => [] }) public data!: any[];
  @Prop({ type: Number, default: 50 }) public rows!: number; // 放多少行
  @Prop({ type: Number, default: 32 }) public itemHeight!: number; // 一行的高度
  @Prop({ type: Number, default: 4 }) public offset!: number; // 距离上下还剩多少获取下一截数据
  @Prop({ type: String, default: 'key' }) public dataKey!: string; // 穿梭框索引key值。唯一值

  public firstHeight = 0;
  public startIndex = 0;
  private scrollHandler: any = null;
  private fillContetnNun = 0; // 几个item能把父级可视区域塞满

  public get renderList() {
    return this.data.length <= this.rows
      ? this.data
      : this.data.slice(this.startIndex, this.endIndx);
  }

  // 内容填充加上偏移量
  public get localRest() {
    return this.fillContetnNun + this.offset;
  }
  public get localContain() {
    return this.rows - this.localRest;
  }
  public get localContainHeight() {
    return this.itemHeight * this.localContain;
  }
  // 截取数组的结束索引
  public get endIndx() {
    return this.startIndex + this.rows;
  }
  // 计算最底层的高度
  public get lastHeight() {
    const h =
      (this.data.length - this.rows) * this.itemHeight - this.firstHeight;
    return h < 0 ? 0 : h;
  }

  @Watch('data')
  public dataHandler(newData: any[], oldData: any[]) {
    if (!this.fillContetnNun) {
      this.$nextTick(() => {
        const el = this.$el as HTMLUListElement;
        this.fillContetnNun = Math.ceil(el.offsetHeight / this.itemHeight); // 10;
      });
      if (this.data.length > this.rows) {
        this.bindScroll();
      }
    } else {
      this.updateProgress(newData.length - oldData.length);
      this.unbindScroll();
      if (this.data.length > this.rows) {
        this.bindScroll();
      }
    }
  }

  public beforeDestroy() {
    this.unbindScroll();
  }

  private throttle(fn: any, delay: number = 10) {
    let valid = true;
    return (e: any) => {
      if (!valid) {
        return;
      }
      valid = false;
      setTimeout(() => {
        fn(e);
        valid = true;
      }, delay);
    };
  }

  private throttleScrollHandler(e: any) {
    const elScrollTop = this.$el.scrollTop;
    const step = Math.floor(elScrollTop / this.localContainHeight);
    const newIndex = step * this.localContain;
    if (this.startIndex !== newIndex) {
      this.startIndex = newIndex;
      this.firstHeight = step * this.localContainHeight;

      this.$nextTick(() => {
        // this.logInfo();
        this.$el.scrollTop = elScrollTop;
      });
    }
  }

  private logInfo() {
    console.log(
      `[${this.startIndex}-${this.endIndx}]`,
      this.endIndx - this.localRest,
    );
  }

  private bindScroll() {
    this.scrollHandler = this.throttle(this.throttleScrollHandler);
    on('scroll', this.$el, this.scrollHandler);
  }

  private unbindScroll() {
    if (this.scrollHandler) {
      off('scroll', this.$el, this.scrollHandler);
      this.scrollHandler = null;
    }
  }

  /**
   * 更新滚动条
   *
   * @private
   * @param {number} changeLen
   */
  private updateProgress(changeLen: number) {
    // 数据是否少于触发点
    if (this.data.length <= this.rows) {
      if (this.startIndex) {
        this.startIndex = 0;
        this.firstHeight = 0;
        const scrollTop = this.$el.scrollHeight - this.itemHeight * changeLen;
        this.$nextTick(() => {
          this.$el.scrollTop = scrollTop;
        });
      }
    }
  }
}
</script>