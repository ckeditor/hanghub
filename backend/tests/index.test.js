const { expect } = require( 'chai' );
const { UserHelper } = require( '../src/helpers/UserHelper' );

const dataFromRedis = {
	IbVmSiD_LoULFK2yAAAB: {
		id: '123',
		state: 'commenting',
	},
	IbVmSiD_LoUPLNYAAAB: {
		id: '123',
		state: 'editing',
	},
	Boc1d1GISKfDnD5zAAA: {
		id: '123',
		state: 'away',
	},
	Boc1GUHISK321D5zAAAQ: {
		id: '123',
		state: 'viewing',
	},
	Boc1GUHIS423DZNSQERQ: {
		id: '1234',
		state: 'viewing',
	}
};

describe( 'getUsers', function() {
	it( 'Should return list of users', function() {
		expect( UserHelper.getUserListFromSessions( dataFromRedis ) ).to.deep.equal( [
			{
				id: '123',
				state: 'editing',
			},
			{
				id: '1234',
				state: 'viewing',
			}
		] );
	} );
} );
