/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * This file is licensed under the terms of the MIT License (see LICENSE.md).
 */

'use strict';

const app = require( 'express' )();
const { Server } = require( 'http' );
const http = new Server( app );
const io = require( 'socket.io' )( http );

const SessionRepository = require( './SessionRepository' );
const dotenv = require( 'dotenv' );
dotenv.config( { path: '.env' } );

const redisConfig = {
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT
};

let driver;

if ( redisConfig.host && redisConfig.port ) {
	const redisAdapter = require( 'socket.io-redis' );
	const RedisDriver = require( './RedisDriver' );

	driver = new RedisDriver( redisConfig );
	driver.connect();

	io.adapter( redisAdapter( redisConfig ) );
} else {
	const InMemoryDriver = require( './InMemoryDriver' );

	driver = new InMemoryDriver();
}

const repository = new SessionRepository( driver );

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

const port = process.env.PORT || 3000;

http.listen( port, () => {
	console.log( 'listening on *:' + port );
} );

function createIssueKey( repoName, pageType, issueId ) {
	return `${ repoName }:${ pageType }/${ issueId }`;
}

async function broadcastUsers( issueKey ) {
	const users = await repository.getAll( issueKey );

	io.in( issueKey ).emit( 'refresh', users );
}

process.on( 'SIGTERM', () => {
	if ( driver.disconnect ) {
		driver.disconnect();
	}

	process.exit( 0 );
} );
