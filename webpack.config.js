const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const config = {
    entry: './src/index.js',
    devtool: 'source-map',
    
    devServer: {
	port: 3000,
	hot: true,
	static: {
	    directory: path.join(__dirname, 'dist'),
	},
	historyApiFallback: {
	    index: 'index.html'
	}
    },
    output: {
	publicPath: "/",
	path: path.resolve(__dirname, 'dist'),
	filename: 'bundle.js'
    },
    plugins: [
      new CopyPlugin({
	  patterns: [{ from: 'src/index.html' }],
	  patterns: [{ from: 'src/images' }],
	  patterns: [{ from: 'src/index.html' }], //For some reason this needs to be in here twice or it gets ignored
      })
    ],
    module: {
	rules: [
	    {
		test: /\.ts(x)?$/,
		loader: 'ts-loader',
		exclude: /node_modules/
	    }
	]
    },
    resolve: {
	extensions: [
	    '.tsx',
	    '.ts',
	    '.js',
	]
    }
};

module.exports = config;
