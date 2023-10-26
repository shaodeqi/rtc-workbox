<template>
  <div id="app">
    <h1><span style="color: #999">用户：</span>{{ peer }}</h1>
    <div style="text-align: center;">
      <img ref="img" height="200" alt="Vue logo"  @click="resetImage" :src="imgSrc" />
    </div>
    <div style="display: flex;">
      <div>
        <button style="width: 80px;" @click="pullText">拉取文本</button>&nbsp;
        <button style="width: 80px;" @click="pullImage">拉取图片</button>&nbsp;
        <button style="width: 80px;" @click="showHelloWorld=true">拉取脚本</button>&nbsp;
      </div>
    </div>
    <ul style="text-align: left;">
      <li v-for="({date, content}, lIndex) in logs" :key="lIndex">
        {{ date }}
        <b>{{ content }}</b>
      </li>
    </ul>
    <HelloWorld v-if="showHelloWorld"></HelloWorld>
  </div>
</template>

<script>

export default {
  components: {
    HelloWorld: () => import('./components/HelloWorld.vue'),
  },
  name: 'App',
  data() {
    return {
      imgSrc: './logo.png',
      peer: new URLSearchParams(location.search).get('peer'),
      logs: [],
      showHelloWorld: false,
    }
  },
  methods: {
    resetImage() {
      this.imgSrc = './logo.png';
    },
    pullImage() {
      this.imgSrc = './img.png';
      this.$refs.img.onload = function (e) {
        console.log(e);
      }
    },
    async pullText() {
      const res = await fetch('./text.js');
      const { text } = await res.json();
      this.logs.push({
        date: new Date().toLocaleString(),
        content: text,
      });

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
  padding: 20px 60px;
}
</style>
