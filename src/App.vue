<template>
  <div id="app">
    <img height="200" alt="Vue logo" @click="handleClick" :src="imgSrc">
    <button @click="handleGetText">{{ text  }}</button>
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
      imgSrc: './logo1.png',
      text: '拉取',
    }
  },
  methods: {
    handleClick() {
      this.imgSrc = './logo2.jpg';
    },
    handleGetText() {
      fetch('./text.json').then(res => res.json()).then(({text}) => {this.text = text})
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
