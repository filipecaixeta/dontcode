process.env.VUE_APP_BACKEND_SOCKETIO = ':80'

module.exports = {
  productionSourceMap: false,
  chainWebpack: config => {
    config.module
      .rule('pug')
      .test(/\.pug$/)
      .use('pug-plain-loader')
        .loader('pug-plain-loader')
        .end()
  }
}