/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * This file is licensed under the terms of the MIT License (see LICENSE.md).
 */

'use strict';

const app = require( 'express' )();
const { Server } = require( 'http' );
const http = new Server( app );
const io = require( 'socket.io' )( http );
const dotenv = require( 'dotenv' );
dotenv.config( { path: '.env' } );

const RedisDriver = require( './RedisDriver' );
const SessionRepository = require( './SessionRepository' );
const { UserHelper } = require( './helpers/UserHelper' );

const driver = new RedisDriver( io );
const repository = new SessionRepository( driver );

io.on( 'connection', socket => {
	const timestamp = new Date();

	socket.on( 'setUser', async ( message, reply ) => {
		const issueKey = createIssueKey( message.repoName, message.pageType, message.issueId );

		const issueSession = { ...message.user, joinedAt: timestamp };

		await repository.createOrUpdate( issueKey, socket.id, issueSession );

		if ( !socket.issueKey ) {
			socket.issueKey = issueKey;
		}

		const issueSessions = await repository.getAll( issueKey );

		socket.join( issueKey );

		const users = UserHelper.getUserListFromSessions( issueSessions );

		reply( null, users );

		socket.broadcast.to( issueKey ).emit( 'refresh', users );
	} );

	socket.on( 'disconnect', async () => {
		await repository.deleteOne( socket.id );

		const issueSessions = await repository.getAll( socket.issueKey );

		if ( !issueSessions[ socket.id ] ) {
			return;
		}

		delete issueSessions[ socket.id ];

		const users = UserHelper.getUserListFromSessions( issueSessions );

		socket.broadcast.to( socket.issueKey ).emit( 'refresh', users );

		socket.leave( socket.issueKey );
	} );
} );

http.listen( process.env.DEFAULT_PORT, () => {
	console.log( 'listening on *:' + process.env.DEFAULT_PORT );
} );

function createIssueKey( repoName, pageType, issueId ) {
	return `${ repoName }:${ pageType }/${ issueId }`;
}
