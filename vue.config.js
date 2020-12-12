module.exports = {
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
              }
            ]
          }
    }
}