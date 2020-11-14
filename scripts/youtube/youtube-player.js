import * as React from 'react';

import YouTube from 'react-youtube';

export default class YoutubePlayer
{
	constructor(videoId, opts, onReady, onStateChange, onPlaybackRateChange)
	{
		this.videoId = videoId;
		this.opts = opts;
		this.onReady = onReady;
		this.onStateChange = onStateChange;
		this.onPlaybackRateChange = onPlaybackRateChange;

		this.player = undefined;
		this.lastStates = [null, null, null];
	}

	isPlayerInState(state)
	{
		return this.player.getPlayerState() == state;
	}

	static checkSyncIgnore(player, t)
	{
		return Math.abs(t - player.getCurrentTime()) < YoutubePlayer.prototype.SYNC_IGNORE_SEC;
	}

	static onReadyWrapper(player, event)
	{
		player.player = event.target;

		player.player.play = function(t)
		{
			console.log('play', t);

			if(
				this.isPlayerInState(YoutubePlayer.prototype.PLAYER_PLAYING)
				&& YoutubePlayer.checkSyncIgnore(this.player, t)
			)
			{
				console.log('play cancel', this.lastStates, this.player.getPlayerState());
				return;
			}

			this.player.seekTo(t);
			this.player.playVideo();
		}.bind(player);

		player.player.pause = function(t)
		{
			console.log('pause', t);

			if(
				this.isPlayerInState(YoutubePlayer.prototype.PLAYER_PAUSED)
				&& YoutubePlayer.checkSyncIgnore(this.player, t)
			)
			{
				console.log('pause cancel', this.lastStates, this.player.getPlayerState());
				return;
			}

			this.player.seekTo(t);
			this.player.pauseVideo();
		}.bind(player);

		player.player.setPlayback = function(t, s)
		{
			console.log('playback', s);

			if(this.player.getPlaybackRate() == s && YoutubePlayer.checkSyncIgnore(this.player, t))
			{
				console.log('playback cancel');
				return;
			}

			this.player.seekTo(t);
			this.player.setPlaybackRate(s);
		}.bind(player);

		player.onReady(event);
	}

	static onStateChangeWrapper(player, event)
	{
		player.lastStates[0] = player.lastStates[1];
		player.lastStates[1] = player.lastStates[2];
		player.lastStates[2] = event.data;

		player.onStateChange(event);
	}

	static createYoutubePlayer(videoId, opts, onReady, onStateChange, onPlaybackRateChange)
	{
		const player = new YoutubePlayer(videoId, opts, onReady, onStateChange, onPlaybackRateChange);

		return [
			player,
			(
				<YouTube
					key='yt-player'
					videoId={player.videoId}
					opts={player.opts}
					onReady={(event) =>
					{
						YoutubePlayer.onReadyWrapper(player, event);
					}}
					onStateChange={(event) =>
					{
						YoutubePlayer.onStateChangeWrapper(player, event);
					}}
					onPlaybackRateChange={player.onPlaybackRateChange}
				/>
			)
		];
	}

	static playerStateToStr(state)
	{
		return [
			'unstarted', // -1
			'ended',     // 0
			'playing',   // 1
			'paused',    // 2
			'buffering', // 3
			'',
			'cued'       // 5
		][state + 1];
	}

	static isStateContinuation(lastStates, state)
	{
		const len = lastStates.length;
		return lastStates[len - 3] == state
			&& lastStates[len - 1] == state
			&& lastStates[len - 2] == YoutubePlayer.prototype.PLAYER_BUFFERING;
	}
}

YoutubePlayer.prototype.SYNC_IGNORE_SEC = 1;

YoutubePlayer.prototype.PLAYER_UNSTARTED = -1;
YoutubePlayer.prototype.PLAYER_ENDED = 0;
YoutubePlayer.prototype.PLAYER_PLAYING = 1;
YoutubePlayer.prototype.PLAYER_PAUSED = 2;
YoutubePlayer.prototype.PLAYER_BUFFERING = 3;
YoutubePlayer.prototype.PLAYER_CUED = 5;

YoutubePlayer.prototype.PLAYER_UNSTARTED_STR = 'unstarted';
YoutubePlayer.prototype.PLAYER_ENDED_STR = 'ended';
YoutubePlayer.prototype.PLAYER_PLAYING_STR = 'playing';
YoutubePlayer.prototype.PLAYER_PAUSED_STR = 'paused';
YoutubePlayer.prototype.PLAYER_BUFFERING_STR = 'buffering';
YoutubePlayer.prototype.PLAYER_CUED_STR = 'cued';

YoutubePlayer.prototype.PLAYER_READY_STR = 'ready';
YoutubePlayer.prototype.PLAYER_PLAYBACK_STR = 'playback';