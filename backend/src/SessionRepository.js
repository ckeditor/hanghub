module.exports = class SessionRepository {
	constructor( driver ) {
		this._driver = driver;
	}

	async getAll( issueKey ) {
		const issueSessions = {};
		const response = await this._driver.client.hgetall( issueKey );

		for ( const session in response ) {
			issueSessions[ session ] = JSON.parse( response[ session ] );
		}

		return issueSessions;
	}

	async set( issueKey, socketId, issueSession ) {
		await this._driver.client.hset( issueKey, socketId, JSON.stringify( issueSession ) );
	}

	async deleteOne( issueKey, socketId ) {
		await this._driver.client.hdel( issueKey, socketId );
	}
};
