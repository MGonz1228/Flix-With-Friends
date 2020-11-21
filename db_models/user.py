class User:
    def __init__(self,
        user_id,
        username=None,
        email=None,
        profile_url=None,
        settings=None,
        oauth_id=None,
        oauth_type=None,
        sid=None
    ):
        self.user_id = user_id
        self.username = username
        self.email = email
        self.profile_url = profile_url
        self.settings = settings
        self.oauth_id = oauth_id
        self.oauth_type = oauth_type
        self.sid = sid

        self.room = None

    def json(self):
        return {
            'user_id': self.user_id,
            'username': self.username,
            'email': self.email,
            'profile_url': self.profile_url,
            'settings': self.settings,
            'oauth_id': self.oauth_id,
            'oauth_type': self.oauth_type
        }

    @staticmethod
    def from_request(req):
        user = User(None, sid=req.sid)
        return user

    @staticmethod
    def get_from_db(cur, user, username=None, email=None, oauth=None):
        query = 'SELECT * FROM account WHERE '
        value = None

        if username is not None:
            query += 'account.username = %s'
            value = (username)
        elif email is not None:
            query += 'account.email = %s'
            value = (email)
        elif oauth is not None:
            query += 'account.oauth_id = %s AND account.oauth_type = %s'
            value = (oauth['id'], oauth['type'])

        if value is None:
            return None

        query += ';'

        cur.execute(query, value)
        result = cur.fetchone()
        if result is None:
            return None

        user.user_id = result['user_id']
        user.username = result['username']
        user.email = result['email']
        user.profile_url = result['profile_url']
        user.settings = result['settings']
        user.oauth_id = result['oauth_id']
        user.oauth_type = result['oauth_type']

        return user

    @staticmethod
    def insert_to_db(cur, user, password=None):
        cur.execute("""
            INSERT INTO account VALUES (DEFAULT, %s, %s, %s, %s, %s, %s, %s) RETURNING user_id
        """, (
            user.username,
            password,
            user.email,
            user.profile_url,
            user.settings,
            user.oauth_id,
            user.oauth_type
        ))

        result = cur.fetchone()
        user.user_id = result['user_id']

        return user

    @staticmethod
    def create_table(cur):
        cur.execute("""
            CREATE TABLE IF NOT EXISTS account (
                user_id BIGSERIAL PRIMARY KEY,
                username TEXT NOT NULL,
                password TEXT,
                email TEXT,
                profile_url TEXT,
                settings TEXT,
                oauth_id TEXT,
                oauth_type TEXT,
                UNIQUE(username),
                UNIQUE(email)
            );
        """)
