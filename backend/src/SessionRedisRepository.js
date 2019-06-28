const SessionBaseRepository = require( './SessionBaseRepository' );

module.exports = class SessionRedisRepository extends SessionBaseRepository {
	constructor( client ) {
		super();
		this._client = client;
	}

	async getAll( issueKey ) {
		const issueSessions = {};
		const response = await this._client.hgetall( issueKey );

		for ( const session in response ) {
			issueSessions[ session ] = JSON.parse( response[ session ] );
		}

		return this._mapUserListFromSessions( issueSessions );
	}

	async set( issueKey, socketId, issueSession ) {
		await this._client.hset( issueKey, socketId, JSON.stringify( issueSession ) );
	}

	async delete( issueKey, socketId ) {
		await this._client.hdel( issueKey, socketId );
	}
};
