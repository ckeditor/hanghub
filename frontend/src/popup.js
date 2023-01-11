/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * This file is licensed under the terms of the MIT License (see LICENSE.md).
 */

const enabledElement = document.getElementById( 'enabled' );

const disableForOrganizationRow = document.getElementById( 'disableForOrganizationRow' );
const disableForRepositoryRow = document.getElementById( 'disableForRepositoryRow' );
const enableForOrganizationRow = document.getElementById( 'enableForOrganizationRow' );
const enableForRepositoryRow = document.getElementById( 'enableForRepositoryRow' );

const disableForOrganizationElement = document.getElementById( 'disableForOrganization' );
const disableForRepositoryElement = document.getElementById( 'disableForRepository' );
const enableForOrganizationElement = document.getElementById( 'enableForOrganization' );
const enableForRepositoryElement = document.getElementById( 'enableForRepository' );

const disableForOrganizationLabel = document.querySelector( 'label[for=disableForOrganization]' );
const disableForRepositoryLabel = document.querySelector( 'label[for=disableForRepository]' );
const enableForOrganizationLabel = document.querySelector( 'label[for=enableForOrganization]' );
const enableForRepositoryLabel = document.querySelector( 'label[for=enableForRepository]' );

let organization;
let repository;
let config;
let hostname;

// GitHub URL parts which aren't the repository name.
const blacklist = [
	'search',
	'notifications',
	'settings',
	'orgs',
	'pulls',
	'issues',
	'marketplace',
	'explore',
	'topics',
	'collections',
	'events',
	'contact',
	'about',
	'features',
	'security',
	'enterprise',
	'customer-stories',
	'pricing',
	'login',
	'join',
	'new',
	'organizations'
];

// Get the current repository and organization.
chrome.tabs.query( { active: true, currentWindow: true }, tabs => {
	const urlParts = tabs[ 0 ].url.split( '/' );
	hostname = urlParts[ 2 ];
	organization = urlParts[ 3 ];
	repository = urlParts[ 4 ];

	// Hide extra options if user is not on github.com
	if ( canDisplayExtraOptions() ) {
		document.querySelector( '.checkbox-container' ).classList.remove( 'hide' );
	}

	// Dynamically set proper labels to checkboxes.
	disableForOrganizationLabel.innerHTML = `Disable for <strong>${ organization }</strong>`;
	disableForRepositoryLabel.innerHTML = `Disable for <strong>${ organization }/${ repository }</strong>`;
	enableForOrganizationLabel.innerHTML = `Enable for <strong>${ organization }</strong>`;
	enableForRepositoryLabel.innerHTML = `Enable for <strong>${ organization }/${ repository }</strong>`;
} );

// Get the current configuration, display the correct section and select appropriate checkboxes.
chrome.storage.sync.get( 'config', data => {
	config = Object.assign( {
		enabled: true,
		disabledOrganizations: [],
		disabledRepositories: [],
		enabledOrganizations: [],
		enabledRepositories: []
	}, data.config );

	if ( config.enabled ) {
		enabledElement.checked = true;
	}

	enableCheckbox( 'disabledOrganizations', organization, disableForOrganizationElement );
	enableCheckbox( 'disabledRepositories', repository, disableForRepositoryElement );
	enableCheckbox( 'enabledOrganizations', organization, enableForOrganizationElement );
	enableCheckbox( 'enabledRepositories', repository, enableForRepositoryElement );

	setProperCheckboxes( config.enabled );
} );

// Handle enabling and disabling the plugin.
enabledElement.addEventListener( 'change', () => {
	config.enabled = enabledElement.checked;

	setProperCheckboxes( config.enabled );

	chrome.storage.sync.set( { config } );
} );

disableForOrganizationElement.addEventListener( 'change', () => {
	toggleConfigItem( 'disabledOrganizations', organization, disableForOrganizationElement.checked );
	disableForRepositoryRow.classList.toggle( 'animation-row' );

	if ( repository ) {
		showRepositoryCheckbox( disableForOrganizationElement.checked, disableForRepositoryElement, disableForRepositoryRow );
	}
} );

disableForRepositoryElement.addEventListener( 'change', () => {
	toggleConfigItem( 'disabledRepositories', repository, disableForRepositoryElement.checked );
} );

enableForOrganizationElement.addEventListener( 'change', () => {
	toggleConfigItem( 'enabledOrganizations', organization, enableForOrganizationElement.checked );
	enableForRepositoryRow.classList.toggle( 'animation-row' );

	if ( repository ) {
		showRepositoryCheckbox( enableForOrganizationElement.checked, enableForRepositoryElement, enableForRepositoryRow );
	}
} );

enableForRepositoryElement.addEventListener( 'change', () => {
	toggleConfigItem( 'enabledRepositories', repository, enableForRepositoryElement.checked );
} );

document.querySelectorAll( 'input[type=checkbox]' ).forEach( element => {
	element.addEventListener( 'mouseup', function() {
		element.blur();
	} );

	element.addEventListener( 'keypress', function( event ) {
		if ( event.key === 'Enter' ) {
			element.checked = !element.checked;
			element.dispatchEvent( new Event( 'change' ) );
		}
	} );
} );

function enableCheckbox( propertyName, searched, element ) {
	if ( config[ propertyName ].includes( searched ) ) {
		element.checked = true;
	}
}

function toggleConfigItem( propertyName, item, shouldBeAdded ) {
	if ( shouldBeAdded ) {
		config[ propertyName ].push( item );
	} else {
		config[ propertyName ] = config[ propertyName ]
			.filter( value => value !== item );
	}

	chrome.storage.sync.set( { config } );
}

function canDisplayExtraOptions() {
	return hostname === 'github.com' && organization && !blacklist.includes( organization );
}

function setProperCheckboxes( isHangHubEnabled ) {
	if ( !canDisplayExtraOptions() ) {
		return;
	}

	if ( isHangHubEnabled ) {
		showCheckbox( disableForOrganizationElement, disableForOrganizationRow );
		showCheckbox( disableForRepositoryElement, disableForRepositoryRow );

		hideCheckbox( enableForOrganizationElement, enableForOrganizationRow );
		hideCheckbox( enableForRepositoryElement, enableForRepositoryRow );

		if ( disableForOrganizationElement.checked || !repository ) {
			hideCheckbox( disableForRepositoryElement, disableForRepositoryRow );
		}
	} else {
		showCheckbox( enableForOrganizationElement, enableForOrganizationRow );
		showCheckbox( enableForRepositoryElement, enableForRepositoryRow );

		hideCheckbox( disableForOrganizationElement, disableForOrganizationRow );
		hideCheckbox( disableForRepositoryElement, disableForRepositoryRow );

		if ( enableForOrganizationElement.checked || !repository ) {
			hideCheckbox( enableForRepositoryElement, enableForRepositoryRow );
		}
	}
}

function showRepositoryCheckbox( canShow, element, row ) {
	if ( canShow ) {
		hideCheckbox( element, row );
	} else {
		showCheckbox( element, row );
	}
}

function showCheckbox( element, row ) {
	element.tabIndex = 0;
	element.removeAttribute( 'aria-hidden' );
	row.classList.remove( 'hide' );
}

function hideCheckbox( element, row ) {
	element.tabIndex = -1;
	element.setAttribute( 'aria-hidden', 'true' );
	row.classList.add( 'hide' );
}
