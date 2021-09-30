<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <br>
  <button @click="cut">裁剪</button>
  <div class="modal" v-if="show">
    <cut-image 
    :title="`title`" 
    :close-show="true" 
    :choose-btn="`choose img`"
    :cut-btn="`cut img`"
    @close="show = !show" 
    :blob="true" 
    @error="errorFn"
    @data="getData"></cut-image>
  </div> 
</template>

<script>

export default {
  name: 'App',
  data(){
    return {
        show:false,
    }
  },
  methods: {
    cut(){
      this.show = !this.show;
    },
    getData(res){
      console.log(res)
    },
    errorFn(file){
      console.log(file)
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  .modal{
    position: absolute;
    left:0;
    top: 0;
    width: 100vw;
    height: 100vh;
    display:flex;
    justify-content: center;
    align-items: center;
    z-index: 9;
    background-color: #0005;
  }
}
</style>
