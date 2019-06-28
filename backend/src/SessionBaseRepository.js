module.exports = class SessionBaseRepository {
	constructor() {
		// Priorities are set from the lowest to the highest.
		this._STATE_PRIORITES = [ 'away', 'viewing', 'commenting', 'editing', 'merging' ];
	}

	_mapUserListFromSessions( issueSessions ) {
		const users = {};

		for ( const socketId in issueSessions ) {
			const issueSession = issueSessions[ socketId ];

			if ( !users[ issueSession.id ] ) {
				users[ issueSession.id ] = [];
			}

			users[ issueSession.id ].push( issueSession );
		}

		return Object.values( users )
			.map( userSessions => {
				return {
					...userSessions[ 0 ],
					state: userSessions.map( session => session.state ).reduce( ( mostImportantState, nextState ) =>
						this._chooseMoreImportantUserState( mostImportantState, nextState ), this._STATE_PRIORITES[ 0 ] )
				};
			} )
			.sort( this._sortUsersByDate );
	}

	_chooseMoreImportantUserState( previousState, currentState ) {
		const previousStateIndex = this._STATE_PRIORITES.indexOf( previousState );
		const currentStateIndex = this._STATE_PRIORITES.indexOf( currentState );

		if ( previousStateIndex > currentStateIndex ) {
			return this._STATE_PRIORITES[ previousStateIndex ];
		}

		return this._STATE_PRIORITES[ currentStateIndex ];
	}

	_sortUsersByDate( prev, next ) {
		return new Date( next.joinedAt ).getMilliseconds() - new Date( prev.joinedAt ).getMilliseconds();
	}
};
