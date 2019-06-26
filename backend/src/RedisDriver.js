const Redis = require( 'ioredis' );
const redisAdapter = require( 'socket.io-redis' );
const dotenv = require( 'dotenv' );
dotenv.config( { path: '.env' } );

class RedisDriver {
	constructor( io ) {
		this.io = io;
		this._config = {
			host: process.env.REDIS_HOST,
			port: process.env.REDIS_PORT
		};
		this._client = this._connect( io );
	}

	get client() {
		return this._client;
	}

	_connect( io ) {
		const client = new Redis( this._config );
		io.adapter( redisAdapter( this._config ) );

		return client;
	}
}

module.exports = RedisDriver;
