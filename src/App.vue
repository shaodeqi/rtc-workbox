<template>
  <div id="app">
    <img height="200" alt="Vue logo" @click="handleClick" :src="imgSrc">
    <div>
      <button @click="handleGetText">拉取文本</button>
      {{ text }}
      <button @click="handleClick">拉取图片</button>
    </div>
  </div>
</template>

<script>

let textTimer = null;
let imgTimer = null;

export default {
  name: 'App',
  data() {
    return {
      imgSrc: './logo1.png',
      text: '拉取',
    }
  },
  methods: {
    handleClick() {
      clearTimeout(imgTimer)
      this.imgSrc = './logo2.jpg';
      imgTimer = setTimeout(() => {
          this.imgSrc = './logo1.png'
      }, 3000)
    },
    handleGetText() {
      clearTimeout(textTimer)

      fetch('./text.js').then(res => res.json()).then(({text}) => {this.text = text}).finally(() => {
        textTimer = setTimeout(() => {
          this.text = '拉取'
        }, 3000)
      })
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
