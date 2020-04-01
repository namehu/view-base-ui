<template>
  <div class="home">
    <VMultipleSelect v-model="selectData"
      :options="options"
      showSelect
      inverse
      style="max-width:300px;"></VMultipleSelect>
    <VTransferBox></VTransferBox>
  </div>
</template>

<script>

export default {
  name: 'Home',
  data() {
    return {
      selectData: [],
      options: [],
    }
  },
  created() {
    for (let i = 0; i < 100; i++) {
      this.options.push({ label: `label-${i}`, value: i,key: `key-${i}` })
    }
  }
}
</script>
