import * as React from 'react';

import { Socket } from './Socket';

import YoutubePlayer from './youtube/youtube-player.js';
import Lerp from './youtube/lerp.js';
import FrameUpdate from './youtube/frame-update.js';


const EVENT_YT_LOAD = 'yt_load';
const EVENT_YT_STATE_CHANGE = 'yt_state_change';
const EVENT_YT_SPHERE_UPDATE = 'yt_sphere_update';

const UPDATE_STATE_EMIT_DELAY = 3000;
const UPDATE_SPHERE_EMIT_DELAY = 1000 / 10;


export function YoutubeContainer()
{
	const [ytPlayer, setYtPlayer] = React.useState(null);
	const [ytComponent, setYtComponent] = React.useState(null);

	const ytPlayerRef = React.useRef();
	ytPlayerRef.current = ytPlayer;

	React.useEffect(() =>
	{
		const [player, component] = YoutubePlayer.createYoutubePlayer('dQw4w9WgXcQ', {
			playerVars: {
				autoplay: 1,
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
		console.log('ready', event);

		ytPlayerRef.current.player.pauseVideo();

		Socket.on(EVENT_YT_LOAD, (data) =>
		{
			console.log('load video', data);
			ytPlayerRef.current.player.loadVideoById(data.videoId);
		});

		Socket.on(EVENT_YT_STATE_CHANGE, (data) =>
		{
			function doState(data)
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
			}

			doState(data);

			/*
			let secdiff = Math.max(0, data.runAt - Math.floor((new Date()).getTime() / 1000));
			if(secdiff > 0)
			{
				setTimeout(() => {
					doState(data);
				}, secdiff * 1000);
			}else
			{
				doState(data);
			}
			*/
		});

		let passive = false;
		let lastRotation = undefined;

		const lerpRotation = new FrameUpdate((timestamp, deltaTime) =>
		{
			if(lastRotation === undefined)
				return;

			const sphereProp = ytPlayerRef.current.player.getSphericalProperties();
			const speed = 5;

			const [yaw, pitch, roll] = Lerp.rotation(
				sphereProp.yaw,
				sphereProp.pitch,
				sphereProp.roll,
				lastRotation.yaw,
				lastRotation.pitch,
				lastRotation.roll,
				deltaTime / 1000 * speed
			);

			ytPlayerRef.current.player.setSphericalProperties({
				yaw: yaw,
				pitch: pitch,
				roll: roll
			});
		});
		lerpRotation.start();

		Socket.on(EVENT_YT_SPHERE_UPDATE, (data) =>
		{
			passive = true;
			lastRotation = data.properties;
		});

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
		}, UPDATE_STATE_EMIT_DELAY);
		stateEmitter.start();

		const rotationEmitter = new FrameUpdate(() =>
		{
			if(passive)
				return;

			const sphereProp = ytPlayerRef.current.player.getSphericalProperties();
			if(sphereProp === undefined)
				return;

			if(Object.keys(sphereProp).length == 0)
				return;

			Socket.emit(EVENT_YT_SPHERE_UPDATE, {
				'properties': sphereProp
			});
		}, UPDATE_SPHERE_EMIT_DELAY);
		rotationEmitter.start();

		emitStateChange(ytPlayerRef.current.player, YoutubePlayer.prototype.PLAYER_READY_STR, 0, 1);
	}

	function onYtStateChange(event)
	{
		emitStateChange(ytPlayerRef.current.player, YoutubePlayer.playerStateToStr(event.data));
	}

	function onYtPlaybackRateChange(event)
	{
		console.log('playback change', event);

		emitStateChange(ytPlayerRef.current.player, YoutubePlayer.prototype.PLAYER_PLAYBACK_STR);
	}

	function emitStateChange(player, state, offset, rate, timestamp)
	{
		offset = offset || player.getCurrentTime();
		rate = rate || player.getPlaybackRate();
		timestamp = timestamp || (new Date()).getTime();

		Socket.emit(EVENT_YT_STATE_CHANGE, {
			'state': state,
			'offset': Math.round(offset * 10000) / 10000,
			'rate': rate,
			'timestamp': timestamp.toString()
		});
	}

	return (
		<div>
			{ytComponent}
		</div>
	);
}
