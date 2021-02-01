import os
import random

from dotenv import load_dotenv
import flask
import flask_socketio
import google.oauth2.id_token
import google.auth.transport.requests

from db_models.user import User


dotenv_path = os.path.join(os.path.dirname(__file__), '../react.env')
load_dotenv(dotenv_path)

GOOGLE_APP_ID = os.getenv('GOOGLE_APP_ID')
TWITTER_CONSUMER_KEY = os.getenv('TWITTER_CONSUMER_KEY')
TWITTER_CONSUMER_SECRET = os.getenv('TWITTER_CONSUMER_SECRET')
FACEBOOK_APP_ID = os.getenv('FACEBOOK_APP_ID')

class LoginNamespace(flask_socketio.Namespace):
    def __init__(self, namespace, server):
        super().__init__(namespace)
        self.namespace = namespace
        self.flaskserver = server

    def on_login_temporary(self, data):
        print("Got an event for new temp user input with data:", data)

    def on_login_oauth_facebook(self, data):
        user = self.flaskserver.get_user_by_request(flask.request, flask.session)
        if 'status' in data['response'].keys():
            self.emit_login_fail(user)
            return

        cur = self.flaskserver.db.cursor()
        User.get_from_db(cur, user, oauth={
            'id': data['response']['id'],
            'type': 'FACEBOOK'
        })

        # user.username = data['response']['name']
        # user.email = data['response']['email']
        # user.profile_url = data['response']['picture']['data']['url']
        # user.oauth_id = data['response']['id']
        # user.oauth_type = 'FACEBOOK'
        user.username = data['response']['name']
        key = 'email'
        if key in data['response'].keys():
            print("True")
            user.email = data['response']['email']
            user.profile_url = data['response']['picture']['data']['url']
        else:
            print("False")
            user.email = data['response']['id']
            user.profile_url = data['response']['picture']['data']['url']
            user.oauth_id = data['response']['id']
            user.oauth_type = 'FACEBOOK'

        user.insert_to_db(cur)
        self.flaskserver.db.commit()
        cur.close()

        self.emit_login_ok(user)

    def on_login_oauth_twitter(self, data):
        print(data)
        user = self.flaskserver.get_user_by_request(flask.request, flask.session)
        key = 'status'
        if key in data['data'].keys():
            self.flaskserver.socketio.emit('login_response', {
                'status': 'fail',
                'userId': None
            }, room=user.sid)
        else:
            cur = self.flaskserver.db.cursor()
            User.get_from_db(cur, user, oauth={
                'id': data['data']['user_id'],
                'type': 'TWITTER'
            })
            user.username = data['data']['screen_name']
            twitter_profile_pic = 'https://twivatar.glitch.me/' + data['data']['screen_name']

            if user.email:
                user.email = data['data']['user_id']
            else:
                user.email = data['data']['user_id']

            user.profile_url = twitter_profile_pic
            user.oauth_id = data['data']['user_id']
            user.oauth_type = 'TWITTER'

            user.insert_to_db(cur)
            self.flaskserver.db.commit()
            cur.close()

            self.emit_login_ok(user)


    def on_login_oauth_google(self, data):
        user = self.flaskserver.get_user_by_request(flask.request, flask.session)
        token = data.get('tokenId')
        failed = False
        req = None

        # https://developers.google.com/identity/sign-in/web/backend-auth
        try:
            req = google.auth.transport.requests.Request()
            idinfo = google.oauth2.id_token.verify_oauth2_token(token, req, GOOGLE_APP_ID)
        except Exception as exc:
            print(exc)
            failed = True
        finally:
            if req is not None:
                req.session.close()

        if failed:
            self.emit_login_fail(user)
            return

        cur = self.flaskserver.db.cursor()
        result = User.get_from_db(cur, user, oauth={
            'id': data['googleId'],
            'type': 'GOOGLE'
    })

        user.username = data['name']
        user.email = data['email']
        user.profile_url = data['profileUrl']
        user.oauth_id = data['googleId']
        user.oauth_type = 'GOOGLE'

        user.insert_to_db(cur)
        self.flaskserver.db.commit()
        cur.close()

        self.emit_login_ok(user)

    def on_login_test(self, data):
        if not self.flaskserver.test_login_enabled:
            return  #pragma: no cover

        user = self.flaskserver.get_user_by_request(flask.request, flask.session)
        user.user_id = -random.randint(1, 65535)
        self.emit_login_ok(user)

    def emit_login_ok(self, user):
        self.flaskserver.socketio.emit('login_response', {
            'status': 'ok',
            'user': {
                'id': user.user_id,
                'username': user.username,
                'email': user.email,
                'profile_url': user.profile_url,
                'settings': user.settings,
                'oauth_id': user.oauth_id,
                'oauth_type': user.oauth_type,
                'sid': user.sid,
                'session_id': user.session_id
            }
        }, room=user.sid)

    def emit_login_fail(self, user):
        self.flaskserver.socketio.emit('login_response', {
            'status': 'fail',
            'user': {}
        }, room=user.sid)
