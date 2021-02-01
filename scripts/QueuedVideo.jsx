/* global process */

import * as React from 'react';
import { UserContext } from './UserProvider';
import { Socket } from './Socket';
import PropTypes from 'prop-types';
import './css/queue.css';


export function QueuedVideo(props)
{
	function playNow(videoUrl, roomID)
	{
		Socket.emit('yt_load', {
			url: videoUrl,
			roomId: roomID
		});

		deQueue(videoUrl, roomID);
	}

	function deQueue(videoUrl, roomID)
	{
		Socket.emit('yt_dequeue', {
			url: videoUrl,
			roomId: roomID
		});
	}

	function getVideoTitle(videoId)
	{
		const apiKey = process.env.YOUTUBE_API_KEY;
		const videoTitle = document.getElementById(videoId).getElementsByClassName('video_title')[0];
		fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`)
			.then(response => response.json())
			.then(data => videoTitle.innerHTML = data['items'][0]['snippet']['title']);
		//videoTitle.innerHTML = title;
	}

	const userDetails = React.useContext(UserContext);
	React.useEffect(() =>
	{
		getVideoTitle(props.queuedVideo.video_id);
	}, []);

	return (
		<div id={props.queuedVideo.video_id} className='queueItem'>
			<div className='header'>
				<span className='left'>
					<img className='thumbnail' alt='Thumbnail' src={`http://img.youtube.com/vi/${props.queuedVideo.video_id}/hqdefault.jpg`} />
				</span>
				<span className='right'>
				</span>
			</div>
			<div>
				{/*
				<span className='video_url'>Video URL: {props.queuedVideo.video_source}</span>
				<br></br>
				<span className='video_id'>Video ID: {props.queuedVideo.video_id}</span>
				<br></br>
				*/}
				<span className='video_title'>Video Title</span>
				<br></br>
				<button id="queueWatchNow" type="submit" onClick={() => playNow(props.queuedVideo.video_source, userDetails.room.id)}>Watch Now</button>
				<br></br>
				<button id="dequeue" type="submit" onClick={() => deQueue(props.queuedVideo.video_source, userDetails.room.id)}>Remove from Playlist</button>
			</div>
		</div>
	);
}

QueuedVideo.propTypes = {
	queuedVideo: PropTypes.object
};
