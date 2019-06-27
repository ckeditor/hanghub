const Redis = require( 'ioredis' );
const redisAdapter = require( 'socket.io-redis' );

module.exports = class RedisDriver {
	constructor( io, host, port ) {
		this.io = io;
		this._config = {
			host,
			port
		};
		this._client = null;
	}

	get client() {
		return this._client;
	}

	connect() {
		const client = new Redis( this._config );

		this.io.adapter( redisAdapter( this._config ) );

		this._client = client;
	}
};

