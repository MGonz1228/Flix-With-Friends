/* global process */

import * as React from 'react';
import { Socket } from './Socket';
import FacebookLogin from 'react-facebook-login'
import { AwesomeButton } from 'react-awesome-button';
import './css/theme-eric.css';

export function FacebookButton()
{
	function responseFacebook(response)
	{
		console.log(response);
		Socket.emit('login_oauth_facebook', {
			'response': response
		});
	}

	return (
		<FacebookLogin
			appId={process.env.FACEBOOK_APP_ID}
			autoLoad={false}
			fields='name,email,picture'
			callback={responseFacebook}
		/>
	);
}
