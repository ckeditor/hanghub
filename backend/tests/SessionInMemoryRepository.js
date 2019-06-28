const { expect } = require( 'chai' );
const SessionInMemoryRepository = require( '../src/SessionInMemoryRepository' );

describe( 'getAll() in-memory implementation', () => {
	const issueKey = 'test/repository:issue/1';
	let repository;

	beforeEach( () => {
		repository = new SessionInMemoryRepository();
	} );

	it( 'should return a sorted ascending list of connected users', () => {
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
			repository.set( issueKey, socketId, sessionsData[ socketId ] );
		}

		expect( repository.getAll( issueKey ) ).to.deep.equal( [
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

	it( 'should return a single connected user when only one user is provided', () => {
		repository.set( issueKey, 'IbVmSiD_LoULFK2yAAAB', {
			id: '123',
			state: 'commenting'
		} );
		expect( repository.getAll( issueKey ) ).to.deep.equal( [
			{
				id: '123',
				state: 'commenting'
			}
		] );
	} );

	it( 'should return an empty list of connected users when there are no users provided', () => {
		expect( repository.getAll( issueKey ) ).to.deep.equal( [] );
	} );
} );

