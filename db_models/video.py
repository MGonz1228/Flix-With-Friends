from db_models.base import Base


class Video(Base):
    def __init__(self, video_id, video_source, playlist_id):
        self.video_id = video_id
        self.video_source = video_source
        self.playlist_id = playlist_id

    def insert_to_db(self, cur):
        cur.execute("""
            INSERT INTO video 
            SELECt %s, %s, %s
            WHERE NOT EXISTS
                (SELECT video_id from video WHERE video_id = %s AND playlist_id = %s);
        """, (
            self.video_id,
            self.video_source,
            self.playlist_id,
            self.video_id,
            self.playlist_id
        ))

    def delete_from_db(self, cur):
        cur.execute("""
            DELETE FROM video WHERE
            video_id = %s AND
            video_source = %s AND
            playlist_id = %s;
        """, (
            self.video_id,
            self.video_source,
            self.playlist_id
        ))

    def serialize(self):
        return {
            'video_id': self.video_id,
            'video_source': self.video_source,
            'playlist_id': self.playlist_id
        }

    @staticmethod
    def create_table(cur):
        cur.execute("""
            CREATE TABLE IF NOT EXISTS video (
                video_id TEXT PRIMARY KEY,
                video_source TEXT NOT NULL,
                playlist_id BIGINT,
                FOREIGN KEY (playlist_id)
                    REFERENCES room_video_playlist (playlist_id)
                    ON UPDATE CASCADE ON DELETE CASCADE
            );
        """)
