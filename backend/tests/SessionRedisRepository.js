const { expect } = require( 'chai' );
const app = require( 'express' )();
const { Server } = require( 'http' );
const http = new Server( app );
const io = require( 'socket.io' )( http );
const RedisDriver = require( '../src/RedisDriver' );
const SessionRedisRepository = require( '../src/SessionRedisRepository' );

describe( 'getAll() Redis implementation', () => {
	const issueKey = 'test/repository:issue/1';
	let repository;

	beforeEach( () => {
		const redisDriver = new RedisDriver( io, 'localhost', '6379' );
		redisDriver.connect();
		redisDriver.client.flushall();
		repository = new SessionRedisRepository( redisDriver.client );
	} );

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
			await repository.set( issueKey, socketId, sessionsData[ socketId ] );
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
		await repository.set( issueKey, 'IbVmSiD_LoULFK2yAAAB', {
			id: '123',
			state: 'commenting'
		} );
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

