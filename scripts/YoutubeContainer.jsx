import * as React from 'react';

import { Socket } from './Socket';
import { UserContext, UserDispatchContext, isCreator } from './UserProvider';

import { Youtube360Controller } from './Youtube360Controller';
import YoutubePlayer from './utils/youtube-player.js';
import FrameUpdate from './utils/frame-update.js';
import Lerp from './utils/lerp.js';


const EVENT_YT_LOAD = 'yt_load';
const EVENT_YT_DEQUEUE = 'yt_dequeue';
const EVENT_YT_STATE_CHANGE = 'yt_state_change';
const EVENT_YT_SPHERE_UPDATE = 'yt_sphere_update';

const UPDATE_STATE_EMIT_DELAY = 3000;
const UPDATE_SPHERE_EMIT_DELAY = FrameUpdate.fps(15);

const LERP_ENABLED = true;
const LERP_SPEED = 32;


export function YoutubeContainer()
{
	const userDetails = React.useContext(UserContext);
	const updateUserDetails = React.useContext(UserDispatchContext);
	const [ytPlayer, setYtPlayer] = React.useState(null);
	const [ytComponent, setYtComponent] = React.useState(null);

	const ytPlayerRef = React.useRef();
	ytPlayerRef.current = ytPlayer;

	React.useEffect(() =>
	{
		const [player, component] = YoutubePlayer.createYoutubePlayer(userDetails.room.currentVideoCode, {
			playerVars: {
				autoplay: 0,
				controls: 1,
				disablekb: 1
			}
		}, onYtReady, onYtStateChange, onYtPlaybackRateChange);

		setYtPlayer(player);
		setYtComponent(component);

		ytPlayerRef.current = ytPlayer;
	}, []);

	function onYtReady(event)
	{
		let lastRotation = undefined;
		let sentVideoLoadOnFinished = false;

		console.log('ready', event);

		ytPlayerRef.current.player.pauseVideo();

		ytPlayerRef.current.onFirstPlay = () =>
		{
			rotationEmitter.start();
		};

		const lerpRotation = new FrameUpdate((timestamp, deltaTime) =>
		{
			if(lastRotation === undefined)
				return;

			const sphereProp = ytPlayerRef.current.player.getSphericalProperties();
			let yaw, pitch, roll, fov;

			if(LERP_ENABLED)
			{
				const t = deltaTime / 1000 * LERP_SPEED;
				[yaw, pitch, roll] = Lerp.rotation(
					sphereProp.yaw,
					sphereProp.pitch,
					sphereProp.roll,
					lastRotation.yaw,
					lastRotation.pitch,
					lastRotation.roll,
					t
				);
				fov = Lerp.float(lastRotation.fov, sphereProp.fov, t);
			}
			else
			{
				[yaw, pitch, roll, fov] = [lastRotation.yaw, lastRotation.pitch, lastRotation.roll, lastRotation.fov];
			}

			ytPlayerRef.current.player.setSphericalProperties({
				yaw: yaw,
				pitch: pitch,
				roll: roll,
				fov: fov
			});
		});
		lerpRotation.start();

		const stateEmitter = new FrameUpdate(() =>
		{
			switch(ytPlayerRef.current.player.getPlayerState())
			{
			case YoutubePlayer.prototype.PLAYER_PLAYING:
				emitStateChange(ytPlayerRef.current.player, YoutubePlayer.prototype.PLAYER_PLAYING_STR);
				break;
			case YoutubePlayer.prototype.PLAYER_PAUSED:
				emitStateChange(ytPlayerRef.current.player, YoutubePlayer.prototype.PLAYER_PAUSED_STR);
				break;
			}

			if(isCreator(userDetails) && ytPlayerRef.current.isVideoFinished())
			{
				if(userDetails.room.playlist && userDetails.room.playlist.videos.length > 0)
				{
					if(!sentVideoLoadOnFinished)
					{
						console.log('loading next video...');
						Socket.emit(EVENT_YT_LOAD, {
							url: userDetails.room.playlist.videos[0].video_id
						});
						sentVideoLoadOnFinished = true;

						Socket.emit(EVENT_YT_DEQUEUE, {
							url: userDetails.room.playlist.videos[0].video_source,
							roomId: userDetails.room.id
						});

					}
				}
			}
		}, UPDATE_STATE_EMIT_DELAY);
		stateEmitter.start();

		const rotationEmitter = new FrameUpdate(() =>
		{
			const sphereProp = ytPlayerRef.current.player.getSphericalProperties();
			if(sphereProp === undefined)
				return;

			if(Object.keys(sphereProp).length == 0)
			{
				rotationEmitter.stop();
				return;
			}

			Socket.emit(EVENT_YT_SPHERE_UPDATE, {
				'properties': sphereProp
			});
		}, UPDATE_SPHERE_EMIT_DELAY);
		rotationEmitter.start();

		Socket.on(EVENT_YT_LOAD, (data) =>
		{
			console.log('loading video...', data);
			ytPlayerRef.current.loadVideoById(data.videoId, (event) =>
			{
				console.log('video loaded', event);
				updateUserDetails({
					room: {
						currentVideoCode: data.videoId
					}
				});
			});
			sentVideoLoadOnFinished = false;
		});

		Socket.on(EVENT_YT_STATE_CHANGE, (data) =>
		{
			data.timestamp = parseInt(data.timestamp, 10);

			const ts = (new Date()).getTime();
			const tsdiff = Math.max(0, ts - data.timestamp);
			const adjustedOffset = data.offset + (tsdiff / 1000);

			switch(data.state)
			{
			case YoutubePlayer.prototype.PLAYER_PLAYING_STR:
				ytPlayerRef.current.player.play(adjustedOffset);
				break;
			case YoutubePlayer.prototype.PLAYER_PAUSED_STR:
				ytPlayerRef.current.player.pause(adjustedOffset);
				break;
			case YoutubePlayer.prototype.PLAYER_PLAYBACK_STR:
				ytPlayerRef.current.player.setPlayback(adjustedOffset, data.rate);
				break;
			}
		});

		Socket.on(EVENT_YT_SPHERE_UPDATE, (data) =>
		{
			lastRotation = data.properties;
		});

		emitStateChange(ytPlayerRef.current.player, YoutubePlayer.prototype.PLAYER_READY_STR, 0, 1);
	}

	function onYtStateChange(event)
	{
		emitStateChange(ytPlayerRef.current.player, YoutubePlayer.playerStateToStr(event.data));
	}

	function onYtPlaybackRateChange()
	{
		emitStateChange(ytPlayerRef.current.player, YoutubePlayer.prototype.PLAYER_PLAYBACK_STR);
	}

	function truncateFloat(val, places)
	{
		const mult = Math.pow(10, places);
		return Math.round(val * mult) / mult;
	}

	function emitStateChange(player, state, offset, rate, timestamp)
	{
		offset = offset || player.getCurrentTime();
		rate = rate || player.getPlaybackRate();
		timestamp = timestamp || (new Date()).getTime();

		Socket.emit(EVENT_YT_STATE_CHANGE, {
			'state': state,
			'offset': truncateFloat(offset, 4),
			'rate': rate,
			'timestamp': timestamp.toString()
		});
	}

	return (
		<div>
			{ytComponent}

			{/*{ isCreator(userDetails) ? (<Youtube360Controller player={ytPlayerRef.current} />) : (<div></div>) }*/}
		</div>
	);
}
