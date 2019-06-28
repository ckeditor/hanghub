const Redis = require( 'ioredis' );
const redisAdapter = require( 'socket.io-redis' );

module.exports = class RedisDriver {
	constructor( io, host, port ) {
		this._io = io;
		this._config = {
			host,
			port
		};
		this.client = null;
	}

	connect() {
		this.client = new Redis( this._config );

		this._io.adapter( redisAdapter( this._config ) );
	}
};

