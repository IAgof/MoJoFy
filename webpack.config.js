var webpack = require('webpack');
var path = require('path');
module.exports = {
    entry: {
        app: __dirname + '/client/index.js',
    },
    output: {
        path: __dirname + '/public/js',
        filename: "[name].js"
    },
    module: {
        loaders: [
            {
              test: /\.js$/,
              exclude: /node_modules/,
              loader: "babel-loader",
              query: {
                presets: ['es2015', "stage-0", 'react']
              }
            }
        ],
    }
};