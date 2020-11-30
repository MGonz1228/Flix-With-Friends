import flask
import flask_socketio


class RoomNamespace(flask_socketio.Namespace):
    def __init__(self, namespace, server):
        super().__init__(namespace)
        self.namespace = namespace
        self.flaskserver = server

    def on_room_create(self, data):
        user = self.flaskserver.get_user_by_request(flask.request)
        room = self.flaskserver.create_room(user.get_session_id())

        room.add_user(user)
        room.set_creator(user)

        return {
            'status': 'ok',
            'room_id': room.room_id,
            'room_name': data['roomName']
        }

    def on_room_join(self, data):
        user = self.flaskserver.get_user_by_request(flask.request)
        room = self.flaskserver.get_room(data['roomId'])

        if room is None:
            return {
                'status': 'fail',
                'error': 'noexist'
            }

        room.add_user(user)

        room.emit('user_join', {
            'user_id': user.user_id,
            'username': user.username
        })

        return {
            'status': 'ok',
            'room_id': room.room_id,
            'description': room.description
        }
