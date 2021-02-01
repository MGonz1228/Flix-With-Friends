import * as React from 'react';
import { ChatMessage } from './ChatMessage';
import { Socket } from './Socket';
import './css/chat.css';


export function Chat()
{
	const [messages, setMessages] = React.useState([]);


	React.useEffect(() =>
	{
		Socket.on('messages_received', (data) =>
		{
			console.log('Message feed updated.');
			var sorted = data.sort(function (a, b)
			{
				return a.timestamp - b.timestamp;
			});
			setMessages(sorted);
			console.log(sorted);

			const messageBox = document.getElementById('messageFeed');
			messageBox.scrollTop = messageBox.scrollHeight - messageBox.clientHeight;
		});
	}, []);

	function handleSubmit()
	{
		var messageInput = document.getElementById('message-input');
		var messageText = messageInput.value;

		if(messageText.length > 0)
		{
			Socket.emit('message_send', {
				'text': messageText,
			});
		}
		messageInput.value = '';
	}

	function checkForEnter(event)
	{
		if (event.key === 'Enter')
		{
			handleSubmit();
		}
	}

	return (
		<div id='chatArea'>
			<div id='messageFeed'>
				{
					messages.map((message) => (<ChatMessage key={message.message_id} message={message} />))
				}
			</div>
			<div id='chat-bar'>
				<input type='text' id='message-input' placeholder='Message' onKeyPress={checkForEnter}></input>
				<button type='submit' id='message-send' onClick={handleSubmit}>SEND</button>
			</div>
		</div>
	);
}
