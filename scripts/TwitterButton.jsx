/* global process */

import * as React from 'react';
import { Socket } from './Socket';
import TwitterLogin from 'react-twitter-login';
import './css/theme-eric.css';

export function TwitterButton()
{
	function authHandler(err, data)
	{
		console.log(err, data);
		Socket.emit('login_oauth_twitter', {
			'err': err,
			'data': data
		});
	}

	return (
		<TwitterLogin
			authCallback={authHandler}
			consumerKey={process.env.TWITTER_CONSUMER_KEY}
			consumerSecret={process.env.TWITTER_CONSUMER_SECRET}
		/>
	);
}
