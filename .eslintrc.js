/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * This file is licensed under the terms of the MIT License (see LICENSE.md).
 */

/* eslint-env node */

module.exports = {
  extends: [
    'ckeditor5',
    'plugin:react/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    mocha: false
  },
  settings: {
    react: {
      version: '16.3'
    }
  },
  rules: {
    'react/prop-types': 'off'
  }
};
