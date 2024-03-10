const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const config = {
	entry: './src/index.js',
	devtool: 'source-map',

	devServer: {
		port: 3000,
		hot: false,
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
			patterns: [{ from: 'src/index.html' }, { from: 'src/images' }],
		})
	],
	module: {
		rules: [
			{
				test: /\.ts(x)?$/,
				loader: 'ts-loader',
				exclude: [/node_modules/, /\.test\.ts(x)?$/]
			},
			{
                test: /\.(png|jpg|gif)$/,
                use: [{
                    loader: 'file-loader',
                    options: {}
                }]
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
