// Priorities are set from the lowest to the highest.
const statePriorities = [ 'away', 'viewing', 'commenting', 'editing', 'merging' ];

class UserHelper {
	static getUserListFromSessions( issueSessions ) {
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
						this._chooseMoreImportantUserState( mostImportantState, nextState ), statePriorities[ 0 ] )
				};
			} )
			.sort( this._sortUsersByDate );
	}

	static _chooseMoreImportantUserState( previousState, currentState ) {
		const previousStateIndex = statePriorities.indexOf( previousState );
		const currentStateIndex = statePriorities.indexOf( currentState );

		if ( previousStateIndex > currentStateIndex ) {
			return statePriorities[ previousStateIndex ];
		}

		return statePriorities[ currentStateIndex ];
	}

	static _sortUsersByDate( prev, next ) {
		return new Date( next.joinedAt ).getMilliseconds() - new Date( prev.joinedAt ).getMilliseconds();
	}
}

module.exports = { UserHelper };
