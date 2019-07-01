/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * This file is licensed under the terms of the MIT License (see LICENSE.md).
 */

// Priorities are set from the lowest to the highest.
const STATE_PRIORITES = [ 'away', 'viewing', 'commenting', 'editing', 'merging' ];

module.exports = class SessionRepository {
	constructor( driver ) {
		this._driver = driver;
	}

	async getAll( issueKey ) {
		const issueSessions = await this._driver.getAll( issueKey );

		return this._mapUserListFromSessions( issueSessions );
	}

	async set( issueKey, socketId, issueSession ) {
		return await this._driver.set( issueKey, socketId, issueSession );
	}

	async delete( issueKey, socketId ) {
		return await this._driver.delete( issueKey, socketId );
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
						this._chooseMoreImportantUserState( mostImportantState, nextState ), STATE_PRIORITES[ 0 ] )
				};
			} )
			.sort( this._sortUsersByDate );
	}

	_chooseMoreImportantUserState( previousState, currentState ) {
		const previousStateIndex = STATE_PRIORITES.indexOf( previousState );
		const currentStateIndex = STATE_PRIORITES.indexOf( currentState );

		if ( previousStateIndex > currentStateIndex ) {
			return STATE_PRIORITES[ previousStateIndex ];
		}

		return STATE_PRIORITES[ currentStateIndex ];
	}

	_sortUsersByDate( prev, next ) {
		return new Date( next.joinedAt ).getMilliseconds() - new Date( prev.joinedAt ).getMilliseconds();
	}
};
