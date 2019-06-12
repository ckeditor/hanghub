// Priorities are set from the lowest to the highest.
const statePriorities = [ 'away', 'viewing', 'commenting', 'editing', 'merging' ];

class UserHelper {
	static getUserListFromSessions( issueSessions ) {
		const users = [];
		for ( const socketId in issueSessions ) {
			const userIndex = users.findIndex( user => user.id === issueSessions[ socketId ].id );
			if ( !userIndex ) {
				users.push( issueSessions[ socketId ] );
				continue;
			}

			users[ userIndex ].state = this._chooseMoreImportantUserState( users[ userIndex ].state, issueSessions[ socketId ].state );
		}

		return users.sort( this._sortUsersByDate );
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
