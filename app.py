import os
import sys

import flask
from dotenv import load_dotenv

import db_models
from flaskserver import FlaskServer
from sqldb import SqlDb


dotenv_path = os.path.join(os.path.dirname(__file__), "sql.env")
load_dotenv(dotenv_path)

db = SqlDb()
if "DATABASE_URL" in os.environ:
    db.connect(SqlDb.uri_to_dsn(os.environ["DATABASE_URL"]))


def main():
    flaskserver = create_flask_server(db)

    if flaskserver.db_connected():
        cur = flaskserver.db.cursor()
        db_models.create_tables(cur)
        flaskserver.db.commit()
        cur.close()
    else:
        print("WARNING: database not connected!", file=sys.stderr)

    flaskserver.run(
        os.environ.get("IP", "0.0.0.0"), int(os.environ.get("PORT", 8080)), debug=True
    )


def create_flask_server(db_obj):
    return FlaskServer(flask.Flask(__name__), db_obj)


if __name__ == "__main__":
    main()
