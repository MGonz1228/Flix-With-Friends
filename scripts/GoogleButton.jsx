/* global process */

import * as React from 'react';
import { Socket } from './Socket';
import { GoogleLogin } from 'react-google-login';

export function GoogleButton()
{
	function responseGoogle(data)
	{
		const pO = data ? data.profileObj : undefined;
		if(pO === undefined)
			return;

		Socket.emit('login_oauth_google', {
			tokenId: data.tokenId,
			googleId: pO.googleId,
			name: pO.name,
			email: pO.email,
			profileUrl: pO.imageUrl,
		});
	}

	return (
		<GoogleLogin
			clientId={process.env.GOOGLE_APP_ID}
			onSuccess={responseGoogle}
			onFailure={responseGoogle}
			cookiePolicy={'single_host_origin'}
			className='google-button'/>
	);
}
