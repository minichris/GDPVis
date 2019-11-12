const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const gitRevisionPlugin = new GitRevisionPlugin();

module.exports = merge(common, {
	output: {
		filename: '[name].[chunkhash].js',
		path: path.resolve(__dirname, 'distNoLogin')
	},
	mode: 'production',
	devtool: 'source-map',
	plugins: [
		new webpack.DefinePlugin({
			'LOGIN': JSON.stringify(false),
			'BRANCH': JSON.stringify(gitRevisionPlugin.branch() + " noLogin"),
			'VERSION': JSON.stringify("noLogin" + gitRevisionPlugin.version()),
		})
	]
});
