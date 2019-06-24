const { expect } = require( 'chai' );
const { getUserListFromSessions } = require( '../../src/helpers/helpers' );

const nowTimestamp = Date.now();
const pastTimeTimestamp = Date.now() - 10000;

const sessionsData = {
	IbVmSiD_LoULFK2yAAAB: {
		id: '123',
		state: 'commenting',
		joinedAt: nowTimestamp
	},
	IbVmSiD_LoUPLNYAAAB: {
		id: '123',
		state: 'editing',
		joinedAt: nowTimestamp
	},
	Boc1d1GISKfDnD5zAAA: {
		id: '123',
		state: 'away',
		joinedAt: nowTimestamp
	},
	Boc1GUHISK321D5zAAAQ: {
		id: '123',
		state: 'viewing',
		joinedAt: nowTimestamp
	},
	Boc1GUHIS423DZNSQERQ: {
		id: '1234',
		state: 'viewing',
		joinedAt: pastTimeTimestamp
	}
};

const singleSessionData = {
	IbVmSiD_LoULFK2yAAAB: {
		id: '123',
		state: 'commenting',
	},
};

describe( 'getUsers', function() {
	it( 'Should return sorted list of users', function() {
		expect( getUserListFromSessions( sessionsData ) ).to.deep.equal( [
			{
				id: '123',
				state: 'editing',
				joinedAt: nowTimestamp
			},
			{
				id: '1234',
				state: 'viewing',
				joinedAt: pastTimeTimestamp
			},
		] );
	} );

	it( 'Should return single user', function() {
		expect( getUserListFromSessions( singleSessionData ) ).to.deep.equal( [
			{
				id: '123',
				state: 'commenting',
			}
		] );
	} );
	it( 'Should return empty array', function() {
		expect( getUserListFromSessions( {} ) ).to.deep.equal( [] );
	} );
} );
