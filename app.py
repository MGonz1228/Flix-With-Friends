from dotenv import load_dotenv
import os

import flask
import flask_socketio

from room import Room
from user import User


app = flask.Flask(__name__)

socketio = flask_socketio.SocketIO(app)
socketio.init_app(app, cors_allowed_origins='*')

appRooms = {}


@socketio.on('connect')
def on_connect():
	global appRooms

	# TODO placeholder room assignment
	if len(appRooms) == 0:
		room = Room()
		appRooms[room.id] = room
	else:
		room = appRooms[list(appRooms.keys())[0]]

	user = User(flask.request.sid)
	room.addUser(user)


@socketio.on('disconnect')
def on_disconnect():
	global appRooms

	# TODO placeholder room assignment
	room = appRooms[list(appRooms.keys())[0]]
	room.removeUser(User(flask.request.sid))

	if len(room) == 0:
		del appRooms[room.id]


@socketio.on('yt-load')
def on_yt_load(data):
	pass


@socketio.on('yt-state-change')
def on_yt_load(data):
	handleYtStateChange(flask.request, data)


@app.route('/')
def index():
	return flask.render_template("index.html")


def handleYtStateChange(request, data):
	user = User(flask.request.sid)

	# TODO placeholder room assignment
	room = appRooms[list(appRooms.keys())[0]]
	if room.creator.id != user.id:
		return

	if data['state'] == 'play':
		socketio.emit('yt-state-change', data, include_self=False)
	elif data['state'] == 'pause':
		socketio.emit('yt-state-change', data, include_self=False)
	elif data['state'] == 'seek':
		socketio.emit('yt-state-change', data, include_self=False)
	else:
		raise Exception()


if __name__ == '__main__':
	socketio.run(
		app,
		host=os.getenv('IP', '0.0.0.0'),
		port=int(os.getenv('PORT', 8080)),
		debug=True
	)
