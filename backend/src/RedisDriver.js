const Redis = require( 'ioredis' );

module.exports = class RedisDriver {
	constructor( config ) {
		this._config = config;
		this._client = null;
	}

	connect() {
		this._client = new Redis( this._config );
	}

	disconnect() {
		this._client.disconnect();
	}

	async getAll( issueKey ) {
		const issueSessions = {};
		const response = await this._client.hgetall( issueKey );

		for ( const session in response ) {
			issueSessions[ session ] = JSON.parse( response[ session ] );
		}

		return issueSessions;
	}

	async set( issueKey, socketId, issueSession ) {
		await this._client.hset( issueKey, socketId, JSON.stringify( issueSession ) );
	}

	async delete( issueKey, socketId ) {
		await this._client.hdel( issueKey, socketId );
	}
};
