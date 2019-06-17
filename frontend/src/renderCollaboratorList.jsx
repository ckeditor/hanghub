/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * This file is licensed under the terms of the MIT License (see LICENSE.md).
 */

import React, { render } from 'preact-compat';

export default function renderCollaboratorList( container, users, pageType ) {
	render( <CollaboratorList pageType={ pageType } users={ users } />, container );
}

function CollaboratorList( { users, pageType } ) {
	return (
		<div>
			<div className="text-bold discussion-sidebar-heading" >
				{ users.length ? `Also on this ${ getPageType( pageType ) }` : 'No other users connected' }
			</div>
			{ users.map( user =>
				<Collaborator user={ user } key={ user.id } />
			) }
		</div>
	);
}

function Collaborator( { user } ) {
	return (
		<span className="css-truncate js-issue-assignees sidebar-assignee">
			<p>
				<span className="js-hovercard-left" data-hovercard-type="user" data-hovercard-url={ user.id ? `/hovercards?user_id=${ user.id }` : null } data-assignee-name={ user.login }>
					<a className="no-underline" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href={ '/' + user.login } aria-describedby="hovercard-aria-description">
						<img className="avatar" src={ `https://avatars2.githubusercontent.com/u/${ user.id }` } width="20" height="20" alt={ user.login } />
					</a>
					<a className="assignee link-gray-dark" data-octo-click="hovercard-link-click" data-octo-dimensions="link_type:self" href={ '/' + user.login } aria-describedby="hovercard-aria-description">
						<span className="css-truncate-target">&nbsp;{ user.login }&nbsp;</span>
						<span className="css-truncate-target" style={ { fontWeight: 'normal' } }>is { user.state }</span>
					</a>
				</span>
			</p>
		</span>
	);
}

function getPageType( pageType ) {
	return pageType === 'issues' ? 'issue' : 'pull request';
}
