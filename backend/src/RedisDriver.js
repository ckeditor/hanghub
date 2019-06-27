const Redis = require( 'ioredis' );
const redisAdapter = require( 'socket.io-redis' );

module.exports = class RedisDriver {
	constructor( io, host, port ) {
		this.io = io;
		this._config = {
			host,
			port
		};
		this._client = this._connect();
	}

	get client() {
		return this._client;
	}

	_connect() {
		const client = new Redis( this._config );

		this.io.adapter( redisAdapter( this._config ) );

		return client;
	}
};

