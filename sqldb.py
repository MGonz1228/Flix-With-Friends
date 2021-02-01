import re

import psycopg2
import psycopg2.extras


class SqlDb:
    def __init__(self):
        self.connection = None

    def connect(self, dsn):
        self.connection = psycopg2.connect(dsn)

    def disconnect(self):
        self.connection.close()
        self.connection = None

    def cursor(self):
        return self.connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    def commit(self):
        self.connection.commit()

    def rollback(self):
        self.connection.rollback()

    def is_connected(self):
        return self.connection is not None

    @staticmethod
    def uri_to_dict(uri):
        match = re.fullmatch(
            r"postgres(?:ql)?://"
            r"(?:(?P<user>(?:[A-Za-z_]|%[0-9A-Fa-f]{2})(?:[A-Za-z0-9_]|%[0-9A-Fa-f]{2})*)"
            r"(?::(?P<password>[^:@,/?=&]+))?@)?"
            r"(?P<host>[^:@,/?=&]+)?(?::(?P<port>[0-9]+))?"
            r"(?:/(?P<dbname>[^:@,/?=&]+))?"
            r"(?:\?(?P<query>.*))?",
            uri,
        )
        if match is None:
            return None

        groups = match.groupdict()

        if groups["port"] is not None:
            port = int(groups["port"])
            if port < 0 or port > 65535:
                return None

        query = groups["query"]
        del groups["query"]

        if query is not None:
            while True:
                match = re.match(r"([A-Za-z0-9_]+)=([^&]*)&?", query)
                if match is None:
                    break

                groups[match[1]] = match[2]
                query = query[match.end() :]

        return groups

    @staticmethod
    def uri_to_dsn(uri, sortkeys=False):
        groups = SqlDb.uri_to_dict(uri)
        if groups is None:
            return None

        def sanitize(val):
            if len(val) == 0:
                return "''"

            val = val.replace("\\", "\\\\")
            val = val.replace("'", "\\'")

            if " " in val:
                return "'%s'" % val
            return val

        dsn = ""

        if sortkeys:
            items = sorted(groups.items(), key=lambda x: x[0])
        else:
            items = groups.items()

        for key, val in items:
            if val is None:
                continue
            dsn += " %s=%s" % (key, sanitize(val))
        dsn = dsn[1:]

        return dsn
