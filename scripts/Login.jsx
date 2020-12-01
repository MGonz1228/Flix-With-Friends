import * as React from 'react';
import { Options } from './Options';
import { FacebookButton } from './FacebookButton';
import { GoogleButton } from './GoogleButton';
import { TwitterButton } from './TwitterButton';
import { Socket } from './Socket';
import './login.css';

export function Login()
{
	const [userFlag, setFlag] = React.useState(false);

	React.useEffect(() =>
	{
		Socket.on('login_response', (data) =>
		{
			console.log(data);

			if(data.status != 'ok')
				return;

			setFlag(true);
		});

	}, []);

	if (userFlag)
	{
		return (<Options />);
	}

	return (
		<div>
			<ul className="flex-container center">
				<li className="top">
					START WATCHING WITH FRIENDS NOW!
					<hr className='line' />
				</li>
			</ul>
		<div className='login'>
			<ul className="flex-container space-evenly">
				<li className="flex-item">
					<img className='fb-img' src='static/images/fb_button.png' alt='fb' />
					<FacebookButton />
				</li>
				<li className="flex-item">		
					<img className='google-img' src='static/images/google.png' alt='google' />
					<GoogleButton />
				</li>
				<li className="flex-item">	
					<img className='twitter-img' src='static/images/twitter.png' alt='twitter' />
					<TwitterButton />
				</li>
			</ul>
		</div>
		</div>
	);
}
	// <div className='login'>
	// 		<div className='section'>
	// 			<img className='fb-img' src='static/images/fb_button.png' alt='fb_button' />
	// 			<FacebookButton />
	// 		</div>
	// 		<div className='section'>
	// 			<img className='google-img' src='static/images/google.png' alt='fb_button' />
	// 			<GoogleButton />
	// 		</div>
	// 		<div className='section'>
	// 			<img className='twitter-img' src='static/images/twitter.png' alt='fb_button' />
	// 			<TwitterButton />
	// 		</div>
	// 	</div>