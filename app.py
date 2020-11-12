import os

from dotenv import load_dotenv
import flask
import flask_sqlalchemy


dotenv_path = os.path.join(os.path.dirname(__file__), 'sql.env')
load_dotenv(dotenv_path)

DATABASE_URI = os.environ.get('DATABASE_URI')
if DATABASE_URI is None:
	sql_user = os.environ['SQL_USER']
	sql_pwd = os.environ['SQL_PASSWORD']
	sql_db = os.environ['SQL_DATABASE']
	DATABASE_URI = 'postgresql://%s:%s@localhost/%s' % (sql_user, sql_pwd, sql_db)

app = flask.Flask(__name__)
db = flask_sqlalchemy.SQLAlchemy(app)

from flaskserver import FlaskServer
flaskserver = FlaskServer(app, db)


if __name__ == '__main__':
	flaskserver.run(debug=True)
