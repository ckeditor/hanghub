/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * This file is licensed under the terms of the MIT License (see LICENSE.md).
 */

/* eslint-env node */

const path = require( 'path' );
const CopyPlugin = require( 'copy-webpack-plugin' );

module.exports = {
	entry: path.resolve( __dirname, 'src/index.js' ),
	output: {
		path: path.resolve( __dirname, 'build' ),
		filename: 'index.js',
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							'@babel/preset-env',
							'@babel/preset-react'
						]
					}
				}
			}
		]
	},
	plugins: [
		new CopyPlugin( [
			{ from: 'src/popup.html', to: '' },
			{ from: 'src/popup.js', to: '' },
			{ from: 'manifest.json', to: '' },
			{ from: 'images', to: 'images' }
		] )
	]
};
