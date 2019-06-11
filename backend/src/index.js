/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * This file is licensed under the terms of the MIT License (see LICENSE.md).
 */

'use strict';

const PORT = process.env.PORT || 3000;

const app = require( 'express' )();
const { Server } = require( 'http' );
const http = new Server( app );
const io = require( 'socket.io' )( http );

const RedisDriver = require( './RedisDriver' );
const SessionRepository = require( './SessionRepository' );

const driver = new RedisDriver( io, 'localhost', 6379 );
const repository = new SessionRepository( driver );

// Priorities are set from the lowest to the highest.
const statePriorities = [ 'away', 'viewing', 'commenting', 'editing', 'merging' ];

io.on( 'connection', socket => {
	const timestamp = new Date();

	socket.on( 'setUser', async ( message, reply ) => {
		const issueKey = createIssueKey( message.repoName, message.issueId );
		const issueSessions = await repository.getAll( issueKey );

		if ( !socket.issueKey ) {
			socket.issueKey = issueKey;
		}

		if ( !issueSessions.hasOwnProperty( socket.id ) ) {
			socket.join( issueKey );
		}
		console.log( 'before update: ', issueSessions );
		issueSessions[ socket.id ] = Object.assign( message.user, { joinedAt: timestamp } );
		console.log( 'updated: ', issueSessions );

		const users = getUsers( issueSessions );

		await repository.createOrUpdate( issueKey, socket.id, message.user );

		socket.broadcast.to( issueKey ).emit( 'refresh', users );

		reply( null, users );
	} );

	socket.on( 'disconnect', async () => {
		const issueSessions = await repository.getAll( socket.issueKey );

		if ( !issueSessions[ socket.id ] ) {
			return;
		}

		delete issueSessions[ socket.id ];

		const users = getUsers( issueSessions );

		await repository.deleteOne( socket );

		socket.broadcast.to( socket.issueKey ).emit( 'refresh', users );

		socket.leave( socket.issueKey );
	} );
} );

http.listen( PORT, () => {
	console.log( 'listening on *:' + PORT );
} );

function sortByDate( prev, next ) {
	return new Date( next.joinedAt ).getMilliseconds() - new Date( prev.joinedAt ).getMilliseconds();
}

function getUsers( issueSessions ) {
	const users = [];
	for ( const socketId in issueSessions ) {
		if ( !users.find( user => user.id === issueSessions[ socketId ].id ) ) {
			users.push( issueSessions[ socketId ] );
			continue;
		}

		const userIndex = users.findIndex( user => user.id === issueSessions[ socketId ].id );

		users[ userIndex ].state = chooseMostImportantState( users[ userIndex ].state, issueSessions[ socketId ].state );
	}

	return users.sort( sortByDate );
}

function chooseMostImportantState( previousState, currentState ) {
	const previousStateIndex = statePriorities.indexOf( previousState );
	const currentStateIndex = statePriorities.indexOf( currentState );

	if ( previousStateIndex > currentStateIndex ) {
		return statePriorities[ previousStateIndex ];
	}

	return statePriorities[ currentStateIndex ];
}

function createIssueKey( repoName, issueId ) {
	return `${ repoName }:${ issueId }`;
}
