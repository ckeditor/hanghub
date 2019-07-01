/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * This file is licensed under the terms of the MIT License (see LICENSE.md).
 */

module.exports = class InMemoryDriver {
	constructor() {
		this._db = {};
	}

	getAll( issueKey ) {
		return this._db[ issueKey ];
	}

	set( issueKey, socketId, issueSession ) {
		if ( !this._db[ issueKey ] ) {
			this._db[ issueKey ] = {};
		}

		this._db[ issueKey ][ socketId ] = issueSession;
	}

	delete( issueKey, socketId ) {
		delete this._db[ issueKey ][ socketId ];
	}
};

