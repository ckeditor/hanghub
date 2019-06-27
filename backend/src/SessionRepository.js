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

	async set( issueKey, socket, issueSession ) {
		await this._driver.client.hset( issueKey, socket.id, JSON.stringify( issueSession ) );
	}

	async deleteOne( socket ) {
		await this._driver.client.hdel( socket.issueKey, socket.id );
	}
};
