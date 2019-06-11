const Redis = require( 'ioredis' );
const redisAdapter = require( 'socket.io-redis' );

class RedisDriver {
	constructor( io, host, port ) {
		this.io = io;
		this.host = host;
		this.port = port;
		this._client = this._connect( io, host, port );
	}

	get client() {
		return this._client;
	}

	_connect( io, host, port ) {
		const client = new Redis();
		io.adapter( redisAdapter( { host, port } ) );
		client.flushall();

		return client;
	}
}

module.exports = RedisDriver;
