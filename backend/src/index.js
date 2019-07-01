/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * This file is licensed under the terms of the MIT License (see LICENSE.md).
 */

'use strict';

const app = require( 'express' )();
const { Server } = require( 'http' );
const http = new Server( app );
const io = require( 'socket.io' )( http );
const redisAdapter = require( 'socket.io-redis' );
const RedisDriver = require( './RedisDriver' );
const SessionRepository = require( './SessionRepository' );
const dotenv = require( 'dotenv' );
dotenv.config( { path: '.env' } );

const config = {
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT
};

const redisDriver = new RedisDriver( config );
redisDriver.connect();

io.adapter( redisAdapter( config ) );

const repository = new SessionRepository( redisDriver );

io.on( 'connection', socket => {
	const timestamp = new Date();

	socket.on( 'setUser', async message => {
		const issueKey = createIssueKey( message.repoName, message.pageType, message.issueId );

		const issueSession = { ...message.user, joinedAt: timestamp };

		await repository.set( issueKey, socket.id, issueSession );

		if ( !socket.issueKey ) {
			socket.issueKey = issueKey;
		}

		socket.join( issueKey );

		await broadcastUsers( issueKey );
	} );

	socket.on( 'disconnect', async () => {
		await repository.delete( socket.issueKey, socket.id );

		await broadcastUsers( socket.issueKey );

		socket.leave( socket.issueKey );
	} );
} );

http.listen( process.env.DEFAULT_PORT, () => {
	console.log( 'listening on *:' + process.env.DEFAULT_PORT );
} );

function createIssueKey( repoName, pageType, issueId ) {
	return `${ repoName }:${ pageType }/${ issueId }`;
}

async function broadcastUsers( issueKey ) {
	const users = await repository.getAll( issueKey );

	io.in( issueKey ).emit( 'refresh', users );
}

process.on( 'SIGTERM', () => {
	redisDriver.disconnect();
	process.exit( 0 );
} );
