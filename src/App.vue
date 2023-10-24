<template>
  <div id="app">
    <div style="position: absolute; width: 100%; left: 0; font-size: 20px; font-weight: bold; padding: 10px; top: 0; background-color: aqua;">webRTC 功能演示</div>
    <h1><span style="color: #999">用户：</span>{{ peer }}</h1>
    <div style="text-align: center;">
      <img height="200" alt="Vue logo" @click="resetImage" :src="imgSrc">
    </div>
    <div style="display: flex;">
      <div>
        <button style="width: 80px;" @click="pullText">拉取文本</button>&nbsp;
        <button style="width: 80px;" @click="pullImage">拉取图片</button>
      </div>
    </div>
    <div style="text-align: left;">
      <pre >{{ logs }}</pre>
    </div>
  </div>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      imgSrc: './logo1.png',
      peer: new URLSearchParams(location.search).get('peer'),
      logs: '',
    }
  },
  methods: {
    resetImage() {
      this.imgSrc = './logo1.png';
    },
    pullImage() {
      this.imgSrc = './logo2.png';
    },
    pullText() {
      fetch('./text.js').then(res => res.json()).then(({text}) => { this.logs += `${new Date().toLocaleString()} ${text}\n` })
    },
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding: 60px;
}
</style>
