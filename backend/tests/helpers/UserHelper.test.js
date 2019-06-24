const { expect } = require( 'chai' );
const { getUserListFromSessions } = require( '../../src/helpers/helpers' );

describe( 'getUsers', function() {
	it( 'should return a sorted ascending list of connected users', function() {
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

		expect( getUserListFromSessions( sessionsData ) ).to.deep.equal( [
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

	it( 'should return a single connected user when only one user is provided', function() {
		const singleSessionData = {
			IbVmSiD_LoULFK2yAAAB: {
				id: '123',
				state: 'commenting',
			},
		};

		expect( getUserListFromSessions( singleSessionData ) ).to.deep.equal( [
			{
				id: '123',
				state: 'commenting',
			}
		] );
	} );

	it( 'should return an empty list of connected users when there are no users provided', function() {
		expect( getUserListFromSessions( {} ) ).to.deep.equal( [] );
	} );
} );
