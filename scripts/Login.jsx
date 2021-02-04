import * as React from 'react';
import { Options } from './Options';
import { GoogleButton } from './GoogleButton';
{/*
import { FacebookButton } from './FacebookButton';
import { TwitterButton } from './TwitterButton';
*/}
import { Socket } from './Socket';
import { UserDispatchContext } from './UserProvider';

import './css/login.css';

export function Login()
{
	const updateUserDetails = React.useContext(UserDispatchContext);
	const [userFlag, setFlag] = React.useState(false);

	React.useEffect(() =>
	{
		Socket.on('login_response', (data) =>
		{
			console.log('LOGIN_RESPONSE ---> ');
			console.log(data);

			if(data.status != 'ok')
				return;

			const user = data.user;

			updateUserDetails({
				id: user.id,
				username: user.username,
				email: user.email,
				profileUrl: user.profile_url,
				settings: user.settings,
				oauthId: user.oauth_id,
				oauthType: user.oauth_type,
				sid: user.sid,
				sessionId: user.session_id
			});

			setFlag(true);
		});
	}, []);

	if (userFlag)
	{
		return (<Options />);
	}

	return (
		<div className="login-content">

			<div className="title-text">
						FLIX WITH FRIENDS
			</div>

			<div className="header-text">
						Your favorite place to watch
				<br />
						Youtube with friends.
			</div>

			<div className='login-container'>
				<div className='login'>
					{/*
					<div className="flex-item">
						<FacebookButton />
					</div>
					*/}

					<div className="flex-item">
						<GoogleButton />
					</div>

					{/*
					<div className="flex-item">
						<TwitterButton />
					</div>
					*/}

				</div>
			</div>
		</div>
	);
}
