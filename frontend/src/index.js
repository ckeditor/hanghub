/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * This file is licensed under the terms of the MIT License (see LICENSE.md).
 */

import HangHub from './HangHub';

const SOCKET_URL = 'https://hanghub.cksource.com/'; // You can replace it with your own server.
const url = new URL( window.location.href );
const urlParts = url.pathname.split( '/' );
const organization = urlParts[ 1 ];
const repository = urlParts[ 2 ];
const hostname = url.hostname;
const hangHub = new HangHub( SOCKET_URL );

chrome.storage.sync.get( 'config', ( { config } ) => {
	if ( !config ) {
		chrome.storage.sync.set( { config: {
			enabled: true,
			disabledOrganizations: [],
			disabledRepositories: [],
			enabledOrganizations: [],
			enabledRepositories: []
		} } );

		return hangHub.start();
	}

	if ( canStart( config, hostname ) ) {
		hangHub.start();
	}
} );

chrome.storage.onChanged.addListener( ( { config } ) => canStart( config.newValue, hostname ) ? hangHub.start() : hangHub.stop() );

function canStart( config, hostname ) {
	const isPluginEnabled = config.enabled || !config.hasOwnProperty( 'enabled' );
	const isDisabledOrganization = config.disabledOrganizations.includes( organization );
	const isDisabledRepository = config.disabledRepositories.includes( repository );
	const isEnabledOrganization = config.enabledOrganizations.includes( organization );
	const isEnabledRepository = config.enabledRepositories.includes( repository );

	if ( hostname !== 'github.com' ) {
		return false;
	}

	// Check if user opened page without required permissions.
	// `img.js-plaxify` is a part of the 404 page.
	if ( document.querySelector( 'img.js-plaxify' ) ) {
		return false;
	}

	if ( isPluginEnabled ) {
		return !isDisabledOrganization && !isDisabledRepository;
	} else {
		return isEnabledOrganization || isEnabledRepository;
	}
}
