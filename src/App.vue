<template>
  <div id="app">
    <img height="200" alt="Vue logo" @click="handleClick" :src="imgSrc">
    <HelloWorld msg="webRTC workbox 测试1"/>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
    HelloWorld: () => import('./components/HelloWorld.vue'),
  },
  data() {
    return {
      imgSrc: './logo1.png'
    }
  },
  methods: {
    handleClick() {
      this.imgSrc = './logo2.jpg';
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
