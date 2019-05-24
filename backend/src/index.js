/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * This file is licensed under the terms of the MIT License (see LICENSE.md).
 */

/* eslint-env node */
'use strict';

const PORT = process.env.PORT || 3000;

const app = require( 'express' )();
const { promisify } = require( 'util' );
const http = require( 'http' ).Server( app );
const io = require( 'socket.io' )( http );
const Redis = require( 'ioredis' );
const redisAdapter = require( 'socket.io-redis' );
io.adapter( redisAdapter( { host: 'localhost', port: 6379 } ) );

const client = new Redis();
const getAsync = promisify( client.get ).bind( client );
const setAsync = promisify( client.set ).bind( client );

// Priorities are set from the lowest to the highest.
const statePriorities = [ 'away', 'viewing', 'typing', 'editing', 'merging' ];

io.on( 'connection', socket => {
	socket.session = {};

	const timestamp = new Date();

	socket.on( 'setUser', async( message, reply ) => {
		const issueKey = `${ message.repoName }:${ message.issueId }`;

		if ( !await getAsync( issueKey ) ) {
			await setAsync( issueKey, '{}' );
		}

		if ( !socket.session.issues ) {
			socket.session.issues = [];
		}

		if ( !socket.session.issues.includes( issueKey ) ) {
			socket.session.issues.push( issueKey );
		}

		const issueUsers = fetchMap( JSON.parse( await getAsync( issueKey ) ) );

		if ( !issueUsers.has( message.user.login ) ) {
			issueUsers.set( message.user.login, { sockets: [], tabs: new Map(), joinedAt: timestamp } );
		}

		const issueUser = await issueUsers.get( message.user.login );

		if ( !issueUser.sockets.includes( socket.id ) ) {
			socket.session.login = message.user.login;

			socket.join( issueKey );

			issueUser.sockets.push( socket.id );
		}
		issueUser.tabs = fetchMap( issueUser.tabs );
		await issueUser.tabs.set( socket.id, message.user.state );

		issueUser.user = message.user;

		const users = getUsers( issueUsers );

		for ( const user of [ ...issueUsers.values() ] ) {
			user.tabs = storeMap( user.tabs );
		}

		await setAsync( issueKey, JSON.stringify( storeMap( issueUsers ) ) );

		socket.broadcast.to( issueKey ).emit( 'refresh', users );

		reply( null, users );
	} );

	socket.on( 'removeUser', async message => {
		const issueKey = `${ message.repoName }:${ message.issueId }`;

		await removeUser( issueKey );
	} );

	socket.on( 'disconnect', async() => {
		for ( const issueKey of socket.session.issues || [] ) {
			await removeUser( issueKey );
		}

		delete socket.issues;
		delete socket.issues;
	} );

	async function removeUser( issueKey ) {
		let issueUsers = await getAsync( issueKey );

		if ( issueUsers ) {
			issueUsers = fetchMap( JSON.parse( issueUsers ) );
		} else {
			return;
		}

		const issueUser = await issueUsers.get( socket.session.login );

		if ( !issueUser ) {
			return;
		}

		if ( !issueUser.sockets.includes( socket.id ) ) {
			return;
		}

		issueUser.tabs = fetchMap( issueUser.tabs );

		if ( issueUser.tabs.has( socket.id ) ) {
			issueUser.tabs.delete( socket.id );
		}

		issueUser.sockets = issueUser.sockets.filter( socketId => socketId !== socket.id );

		if ( issueUser.sockets.length ) {
			return;
		}

		issueUsers.delete( socket.session.login );

		const users = getUsers( issueUsers );

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
	return [ ...issueUsers.values() ]
		.sort( sortByDate )
		.map( issueUser => ( Object.assign( {},
			issueUser.user,
			{ state: chooseMostImportantState( [ ...issueUser.tabs.values() ] ) }
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

function fetchMap( object ) {
	const map = new Map();
	Object.keys( object ).forEach( key => {
		map.set( key, object[ key ] );
	} );
	return map;
}
function storeMap( map ) {
	const object = {};
	for ( const [ key, value ] of map ) {
		object[ key ] = value;
	}

	return object;
}
