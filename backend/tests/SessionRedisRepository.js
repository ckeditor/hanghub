/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * This file is licensed under the terms of the MIT License (see LICENSE.md).
 */

const { expect } = require( 'chai' );
const Redis = require( 'ioredis' );
const RedisDriver = require( '../src/RedisDriver' );
const SessionRepository = require( '../src/SessionRepository' );

describe( 'SessionRedisRepository', () => {
	const issueKey = 'test/repository:issue/1';
	const config = {
		host: 'localhost',
		port: '6379'
	};
	let repository, redisDriver, redisClient;

	beforeEach( async () => {
		redisClient = new Redis( config );
		await redisClient.flushall();

		redisDriver = new RedisDriver( config );
		redisDriver.connect();

		repository = new SessionRepository( redisDriver );
	} );

	afterEach( async () => {
		await redisClient.disconnect();
		await redisDriver.disconnect();
	} );

	describe( 'getAll() ', () => {
		it( 'should return a sorted ascending list of connected users', async () => {
			const sessionsData = {
				IbVmSiD_LoULFK2yAAAB: {
					id: '123',
					state: 'commenting',
					joinedAt: 1561365746095
				},
				IbVmSiD_LoUPLNYAAAB: {
					id: '123',
					state: 'editing',
					joinedAt: 1561365746095
				},
				Boc1d1GISKfDnD5zAAA: {
					id: '123',
					state: 'away',
					joinedAt: 1561365746095
				},
				Boc1GUHISK321D5zAAAQ: {
					id: '123',
					state: 'viewing',
					joinedAt: 1561365746095
				},
				Boc1GUHIS423DZNSQERQ: {
					id: '1234',
					state: 'viewing',
					joinedAt: 1561365745095
				}
			};

			for ( const socketId in sessionsData ) {
				await redisClient.hset( issueKey, socketId, JSON.stringify( sessionsData[ socketId ] ) );
			}

			expect( await repository.getAll( issueKey ) ).to.deep.equal( [
				{
					id: '123',
					state: 'editing',
					joinedAt: 1561365746095
				},
				{
					id: '1234',
					state: 'viewing',
					joinedAt: 1561365745095
				},
			] );
		} );

		it( 'should return a single connected user when only one user is provided', async () => {
			await redisClient.hset( issueKey, 'IbVmSiD_LoULFK2yAAAB', JSON.stringify( {
				id: '123',
				state: 'commenting'
			} ) );

			expect( await repository.getAll( issueKey ) ).to.deep.equal( [
				{
					id: '123',
					state: 'commenting'
				}
			] );
		} );

		it( 'should return an empty list of connected users when there are no users provided', async () => {
			expect( await repository.getAll( issueKey ) ).to.deep.equal( [] );
		} );
	} );

	describe( 'set()', () => {
		it( 'should return a single connected user after insertion', async () => {
			await repository.set( issueKey, 'IbVmSiD_LoULFK2yAAAB', {
				id: '123',
				state: 'commenting'
			} );

			expect( Object.keys( await redisClient.hgetall( issueKey ) ).length ).to.equal( 1 );
		} );
	} );

	describe( 'delete()', () => {
		it( 'should return a single connected user after insertion and an empty list of connected users after deletion', async () => {
			await redisClient.hset( issueKey, 'IbVmSiD_LoULFK2yAAAB', JSON.stringify( {
				id: '123',
				state: 'commenting'
			} ) );

			expect( Object.keys( await redisClient.hgetall( issueKey ) ).length ).to.equal( 1 );

			await repository.delete( issueKey, 'IbVmSiD_LoULFK2yAAAB' );

			expect( Object.keys( await redisClient.hgetall( issueKey ) ).length ).to.equal( 0 );
		} );

		it( 'should not crash if there is not matching key', async () => {
			await repository.delete( 'invalidKey', 'IbVmSiD_LoULFK2yAAAB' );

			expect( Object.keys( await redisClient.hgetall( 'invalidKey' ) ).length ).to.equal( 0 );
		} );
	} );
} );

