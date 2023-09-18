const { defineConfig } = require('@vue/cli-service')
const { InjectManifest } = require('workbox-webpack-plugin');
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      // 静态资源离线缓存
      new InjectManifest({
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024, // 最大缓存 20M 文件
        swSrc: './public/sw.js',
        include: [/\.(js|svg|png|css|jpg)$/],
      }),
    ]
  }
})
