import React, { useState } from 'react';
import { Content } from './Content';
import { Socket } from './Socket';
import { UserContext, UserDispatchContext } from './UserProvider';
import './css/Options.css';
import './css/theme-eric.css';


export function Options()
{
	document.body.style.background = 'black';
	const updateUserDetails = React.useContext(UserDispatchContext);
	const [userFlag, setFlag] = useState(false);

	const userDetails = React.useContext(UserContext);
	var firstName = userDetails.username.split(' ')[0];

	function enterRoom()
	{
		setFlag(true);
	}



	function onRoomNewClick()
	{
		Socket.emit('room_create', {
			description: 'test room',
			playlist: 'none'
		}, (data) =>
		{
			console.log('playlist -->');
			console.log(data);
			console.log('------');
			if(data.status != 'ok')
				return;

			updateUserDetails({
				room: {
					id: data.room_id,
					description: data.room_name,
					currentVideoCode: data.current_video_code,
					isCreator: true
				}
			});
			enterRoom();
		});
	}

	function onRoomJoinClick()
	{
		Socket.emit('room_join', {
			roomId: document.getElementById('join-input').value
		}, (data) =>
		{
			console.log(data);
			if(data.status != 'ok')
				return;

			updateUserDetails({
				room: {
					id: data.room_id,
					description: data.room_name,
					currentVideoCode: data.current_video_code,
					isCreator: false
				}
			});
			enterRoom();
		});
	}

	function onKeyUp(event)
	{
		if(event.key == 'Enter')
			onRoomJoinClick();
	}

	if(userFlag)
	{
		return (<Content />);
	}

	return (
		<>
			<div className="title-text">
			FLIX WITH FRIENDS
			</div>
			<div className="options-wrapper">
				<span id="welcome-message">Welcome, {firstName}. Ready to watch?</span>
				<div className="join-room">
					<>
						<input id="join-input" placeholder="Enter room code" onKeyUp={onKeyUp}></input>
						<button id="join-button" onClick={() =>
						{
							onRoomJoinClick();
						}}>JOIN</button>
					</>
				</div>
				<div id="create-room">
					<>
						<span id="no-code">No code? </span>
						<a id="create-room" onClick={() =>
						{
							onRoomNewClick();
						}}>Create a room.</a>
					</>
				</div>
			</div>
			<a href="https://github.com/gpeppel/flix-with-friends" target="_blank" rel="noreferrer">
				<img className="github-logo" src="/static/images/github.png" alt="Github link"></img>
			</a>
		</>
	);
}
