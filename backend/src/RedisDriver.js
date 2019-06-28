const Redis = require( 'ioredis' );

module.exports = class RedisDriver {
	constructor( config ) {
		this._config = config;
		this.client = null;
	}

	connect() {
		this.client = new Redis( this._config );
	}
};

