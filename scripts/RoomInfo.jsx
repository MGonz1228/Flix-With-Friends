import * as React from 'react';
import { Socket } from './Socket';
import { User } from './User';
import { UserContext } from './UserProvider';
import { Offline, Online } from 'react-detect-offline';

export function RoomInfo()
{
	//const [users, setUsers] = React.useState({});
	const userDetails = React.useContext(UserContext);
	const [creator, setCreator] = React.useState('');
	const [count, setCount] = React.useState(0);
	const [alone, setAlone] = React.useState(false);

	function getRoomInfo()
	{
		React.useEffect(() =>
		{
			Socket.on('room_info_received', (data) =>
			{
				var info = data['room_info'];
				console.log('Room info updated.');
				console.log(info);

				var roomCreator = info['creator'];
				setCreator(roomCreator);

				var activeUsers = info['users'];
				setCount(Object.keys(activeUsers).length);
				//setUsers(activeUsers);

				var alone = count == 1 ? true : false;
				setAlone(alone);
			});
		});
	}

	function getSessionId(user)
	{
		if(user.session_id)
			return user;
		return user.sid;
	}

	function copyRoomId()
	{
		const input = document.createElement('input');
		input.value = userDetails.room.id;

		document.body.appendChild(input);
		input.select();
		document.execCommand('copy');
		document.body.removeChild(input);

		alert('Copied Room ID ' + userDetails.room.id);
	}

	getRoomInfo();

	return (
		<div id="room-info-box">
			<Online>
				<p className="room-connected">CONNECTED</p>
			</Online>

			<Offline>
				<p className="room-disconnected">DISCONNECTED (Check Network)</p>
			</Offline>
			<p className="room-count">{alone ? 'There are ' + count + ' people in this room.' : 'There is 1 person in this room (that\'s you!)'}</p>
			<p className="room-info">Room Host: {creator ? creator.username : 'Nobody'}</p>
			<button onClick={copyRoomId} id='copy-button'>Copy Room ID</button>
			{/*<p>Users:</p>
						<div id="userFeed">
				{
					Object.values(users).map((user) => (<User key={getSessionId(user)} user={user} /> ))
				}
			</div>
			*/}
		</div>
	);
}
