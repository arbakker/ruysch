module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
  ? '/ruysch/'
  : '/',
    configureWebpack: {
        // It will be merged into the final Webpack config
        module : {
            rules: [
              {
                test: require.resolve("jsonix"),
                use:[
                  "imports-loader?type=commonjs&additionalCode=var%20require%20=%20null",
                  "exports-loader?type=commonjs&exports=single|Jsonix"
                ]
              },
              {
                test: /\.(png|jpe?g|gif|ico)$/i,
                use: [
                  {
                    loader: 'file-loader',
                  },
                ],
              },            
            ]
          }
    }
}