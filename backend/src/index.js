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
		const issueUsers = getUsersFromDatabase( issueKey );

		if ( !socket.issueKey ) {
			socket.issueKey = issueKey;
		}

		if ( !issueUsers.hasOwnProperty( message.user.login ) ) {
			issueUsers[ message.user.login ] = { tabs: {}, joinedAt: timestamp };
		}

		const issueUser = issueUsers[ message.user.login ];

		if ( !issueUser.tabs.hasOwnProperty( socket.id ) ) {
			socket.login = message.user.login;

			socket.join( issueKey );
		}

		issueUser.tabs[ socket.id ] = message.user.state;
		issueUser.user = message.user;

		const users = getUsers( issueUsers );

		await client.hset( issueKey, message.user.login, JSON.stringify( issueUser ) );

		socket.broadcast.to( issueKey ).emit( 'refresh', users );

		reply( null, users );
	} );

	socket.on( 'removeUser', async () => {
		await removeUser( socket.issueKey );
	} );

	socket.on( 'disconnect', async () => {
		await removeUser( socket.issueKey );
	} );

	async function removeUser( issueKey ) {
		const issueUsers = getUsersFromDatabase( issueKey );

		const issueUser = issueUsers[ socket.login ];

		if ( !issueUser || !issueUser.tabs.hasOwnProperty( socket.id ) ) {
			return;
		}

		if ( issueUser.tabs.hasOwnProperty( socket.id ) ) {
			delete issueUser.tabs[ socket.id ];
		}

		if ( Object.keys( issueUser.tabs ).length ) {
			return;
		}

		delete issueUsers[ socket.login ];

		const users = getUsers( issueUsers );

		await client.hset( issueKey, socket.login, JSON.stringify( issueUser ) );

		socket.broadcast.to( issueKey ).emit( 'refresh', users );

		socket.leave( issueKey );
	}
} );

http.listen( PORT, () => {
	console.log( 'listening on *:' + PORT );
} );

function sortByDate( prev, next ) {
	return new Date( next.joinedAt ).getMilliseconds() - new Date( prev.joinedAt ).getMilliseconds();
}

function getUsers( issueUsers ) {
	return Object.values( issueUsers )
		.sort( sortByDate )
		.map( issueUser => ( Object.assign( {},
			issueUser.user,
			{ state: chooseMostImportantState( Object.values( issueUser.tabs ) ) }
		) ) );
}

function chooseMostImportantState( states ) {
	let mostImportantStateIndex = 0;

	for ( const state of states ) {
		if ( statePriorities.indexOf( state ) > mostImportantStateIndex ) {
			mostImportantStateIndex = statePriorities.indexOf( state );
		}
	}

	return statePriorities[ mostImportantStateIndex ];
}

function createIssueKey( repoName, issueId ) {
	return `${ repoName }:${ issueId }`;
}

async function getUsersFromDatabase( issueKey ) {
	const issueUsers = {};
	const response = await client.hgetall( issueKey );

	for ( const user in response ) {
		issueUsers[ user ] = JSON.parse( response[ user ] );
	}

	return issueUsers;
}
