const SessionBaseRepository = require( './SessionBaseRepository' );

module.exports = class SessionInMemoryRepository extends SessionBaseRepository {
	constructor() {
		super();
		this._db = {};
	}

	getAll( issueKey ) {
		const issueSessions = this._db[ issueKey ];
		return this._mapUserListFromSessions( issueSessions );
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

