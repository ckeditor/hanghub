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
const Redis = require( 'ioredis' );
const redisAdapter = require( 'socket.io-redis' );
io.adapter( redisAdapter( { host: 'localhost', port: 6379 } ) );

const client = new Redis();

// Priorities are set from the lowest to the highest.
const statePriorities = [ 'away', 'viewing', 'commenting', 'editing', 'merging' ];

io.on( 'connection', socket => {
	const timestamp = new Date();

	socket.on( 'setUser', async ( message, reply ) => {
		const issueKey = createIssueKey( message.repoName, message.issueId );
		const issueSessions = await getSessionsFromDatabase( issueKey );

		if ( !socket.issueKey ) {
			socket.issueKey = issueKey;
		}

		if ( !issueSessions.hasOwnProperty( issueKey ) ) {
			issueSessions[ socket.id ] = Object.assign( message.user, { joinedAt: timestamp } );
		}

		const issueSession = issueSessions[ socket.id ];

		if ( !issueSessions.hasOwnProperty( socket.id ) ) {
			socket.join( issueKey );
		}

		const users = getUsers( issueSessions );

		await client.hset( issueKey, socket.id, JSON.stringify( issueSession ) );

		socket.broadcast.to( issueKey ).emit( 'refresh', users );

		reply( null, users );
	} );

	socket.on( 'disconnect', async () => {
		const issueSessions = await getSessionsFromDatabase( socket.issueKey );

		if ( !issueSessions[ socket.id ] ) {
			return;
		}

		delete issueSessions[ socket.id ];

		const users = getUsers( issueSessions );

		client.hdel( socket.issueKey, socket.id );

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
		if ( !users.length || !users.find( user => user.id === issueSessions[ socketId ].id ) ) {
			users.push( issueSessions[ socketId ] );
			continue;
		}
		const userIndex = users.findIndex( user => user.id === issueSessions[ socketId ].id );
		users[ userIndex ].state = chooseMostImportantState( users[ userIndex ].state, issueSessions[ socketId ].state );
	}

	return users.sort( sortByDate );
}

function chooseMostImportantState( previousState, currentState ) {
	console.log( previousState, currentState );
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

async function getSessionsFromDatabase( issueKey ) {
	const issueSessions = {};
	const response = await client.hgetall( issueKey );

	for ( const session in response ) {
		issueSessions[ session ] = JSON.parse( response[ session ] );
	}

	return issueSessions;
}
