/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * This file is licensed under the terms of the MIT License (see LICENSE.md).
 */

/* eslint-env node */

module.exports = {
    extends: "ckeditor5",
    env: {
        "browser": true,
        "webextensions": true
    },
    rules: {
        'max-len': 'off'
    },
    parserOptions: {
        ecmaVersion: 2018,
    }
};
