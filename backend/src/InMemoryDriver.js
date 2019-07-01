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

