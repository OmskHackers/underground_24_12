import aiosqlite

global DB_CONN


async def add_info(r, g, ct):
    query = 'INSERT INTO strongbox (r, g, ct) VALUES (?, ?, ?);'
    async with DB_CONN.execute(query, (r, g, ct)) as cursor:
        strongbox_id = cursor.lastrowid
    return strongbox_id


async def get_info(strongbox_id):
    query = 'SELECT * FROM strongbox WHERE id = ?;'
    async with DB_CONN.execute(query, (strongbox_id,)) as cursor:
        strongbox = await cursor.fetchone()
    return strongbox


async def commit_transaction():
    await DB_CONN.commit()


async def connect_db():
    global DB_CONN
    DB_CONN = await aiosqlite.connect('data/sqlite.db')
