'use strict'
const path = require('path')
module.exports = {
  publicPath: './', // 资源目录
  outputDir: 'dist', // 打包所在位置
  assetsDir: 'static', // 打包之后的静态文件，这个例子完整就是'dist/static'
  lintOnSave: process.env.NODE_ENV === 'production', // eslint是否在调试的时候就报错，一般本地开发的时候是打开，然后生产环境就关掉 防止以为这些格式在浏览器一堆报错
  productionSourceMap: false, // 不想被看到源码，就把productionSourceMap 设置为false，既可以减少包大小，也可以加密源码
  devServer: { // 本地调试的devserver
    port: 8080, // 端口
    https: true,
    open: true // 是不是默认打开端口页面
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less'
    }
  },
  css: {
    // postcss-pxtorem适配
    loaderOptions: {
      postcss: {
        plugins: [
          require('postcss-pxtorem')({
            rootValue: 37.5,
            propList: ['*']
          })
        ]
      }
    }
  }
}
