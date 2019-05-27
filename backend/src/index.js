/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * This file is licensed under the terms of the MIT License (see LICENSE.md).
 */

'use strict';

const PORT = process.env.PORT || 3000;

const app = require( 'express' )();
const { promisify } = require( 'util' );
const { Server } = require( 'http' );
const http = new Server( app );
const io = require( 'socket.io' )( http );
const Redis = require( 'ioredis' );
const redisAdapter = require( 'socket.io-redis' );
io.adapter( redisAdapter( { host: 'localhost', port: 6379 } ) );

const client = new Redis();
const fetchUsers = promisify( client.get ).bind( client );
const storeUsers = promisify( client.set ).bind( client );

// Priorities are set from the lowest to the highest.
const statePriorities = [ 'away', 'viewing', 'commenting', 'editing', 'merging' ];

io.on( 'connection', socket => {
	socket.session = {};

	const timestamp = new Date();

	socket.on( 'setUser', async ( message, reply ) => {
		const issueKey = createIssueKey( message.repoName, message.issueId );
		const issueUsers = JSON.parse( await fetchUsers( issueKey ) || '{}' );

		if ( !socket.session.issues ) {
			socket.session.issues = [];
		}

		if ( !socket.session.issues.includes( issueKey ) ) {
			socket.session.issues.push( issueKey );
		}

		if ( !issueUsers.hasOwnProperty( message.user.login ) ) {
			issueUsers[ message.user.login ] = { sockets: [], tabs: {}, joinedAt: timestamp };
		}

		const issueUser = issueUsers[ message.user.login ];

		if ( !issueUser.sockets.includes( socket.id ) ) {
			socket.session.login = message.user.login;

			socket.join( issueKey );

			issueUser.sockets.push( socket.id );
		}

		issueUser.tabs[ socket.id ] = message.user.state;

		issueUser.user = message.user;

		const users = getUsers( issueUsers );

		await storeUsers( issueKey, JSON.stringify( issueUsers ) );

		socket.broadcast.to( issueKey ).emit( 'refresh', users );

		reply( null, users );
	} );

	socket.on( 'removeUser', async message => {
		const issueKey = createIssueKey( message.repoName, message.issueId );

		await removeUser( issueKey );
	} );

	socket.on( 'disconnect', async () => {
		for ( const issueKey of socket.session.issues || [] ) {
			await removeUser( issueKey );
		}

		delete socket.issues;
	} );

	async function removeUser( issueKey ) {
		const issueUsers = JSON.parse( await fetchUsers( issueKey ) || '{}' );
		const issueUser = issueUsers[ socket.session.login ];

		if ( !issueUser || !issueUser.sockets.includes( socket.id ) ) {
			return;
		}

		if ( issueUser.tabs.hasOwnProperty( socket.id ) ) {
			delete issueUser.tabs[ socket.id ];
		}

		issueUser.sockets = issueUser.sockets.filter( socketId => socketId !== socket.id );

		if ( issueUser.sockets.length ) {
			return;
		}

		delete issueUsers[ socket.session.login ];

		const users = getUsers( issueUsers );

		await storeUsers( issueKey, JSON.stringify( issueUsers ) );

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
