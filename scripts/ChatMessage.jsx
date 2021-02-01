import * as React from 'react';
import PropTypes from 'prop-types';
import './css/chat.css';


export function ChatMessage(props)
{
	return (
		<div className='message'>
			<div className='header'>
				<img className='profileImg' alt='Profile' src={props.message.user.profile_url} />
				<span className='username'>{props.message.user.username}</span>
				<span>:</span>
			</div>
			{/*<span className='right'>
					<span className='timestamp'>{timestampToStr(props.message.timestamp)}</span>
				</span>*/}
			<div>
				<p className='text'>{props.message.text}</p>
			</div>
		</div>
	);
}

ChatMessage.propTypes = {
	message: PropTypes.object
};

function timestampToStr(timestamp)
{
	function lp0(x)
	{
		return x.toString().padStart(2, '0');
	}

	const date = new Date(timestamp);
	return `${lp0(date.getHours())}:${lp0(date.getMinutes())}`;
}
