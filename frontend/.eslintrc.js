/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * This file is licensed under the terms of the MIT License (see LICENSE.md).
 */

/* eslint-env node */

module.exports = {
  extends: '../.eslintrc.js',
  env: {
    browser: true,
    webextensions: true
  },
  rules: {
    'max-len': 'off'
  }
}
