
import * as React from 'react';
import { Chat } from './Chat';
import { RoomInfo } from './RoomInfo';
import { YoutubeContainer } from './YoutubeContainer';
import { HostOptions } from './HostOptions';
import { UserContext, UserDispatchContext } from './UserProvider';
import { Socket } from './Socket';
import { Queue } from './Queue';
import './css/content.css';


export function Content()
{
	document.body.style.background = '#121212';
	const userDetails = React.useContext(UserContext);
	const updateUserDetails = React.useContext(UserDispatchContext);

	React.useEffect(() =>
	{
		Socket.on('room_info_received', (data) =>
		{
			updateUserDetails({
				room: {
					isCreator: (data.room_info.creator ?
						data.room_info.creator.sid == userDetails.sid
						: false
					)
				}
			});
		});

		Socket.emit('user_join', {});
	}, []);


	return (
		<div className='main-content'>
			<div className='main-panel'>
				<RoomInfo />
				<Chat />
			</div>
			<div className='media-area'>
				<YoutubeContainer />
			</div>
			<div className='main-panel'>
				<div>
					<Queue />
					<br></br>
					<HostOptions />
				</div>
			</div>
		</div>
	);
}
