from db import *
from crypto import encrypt

MAX_SIZE_SECRET = 32


async def add(tx, args):
    try:
        secret = args[1]
        if len(secret) > MAX_SIZE_SECRET:
            tx.write("Превышен максимальный размер\n".encode('utf-8'))
            return

        r, g, ct = encrypt(secret)

        strongbox_id = await add_info(str(r), str(g), str(ct))
        await commit_transaction()

        tx.write(f"ID твоего сейфа: {strongbox_id}\n".encode('utf-8'))

    except:
        tx.write(f"Ошибка при добавлении :(\n".encode('utf-8'))


async def get(tx, args):
    try:
        ID = int(args[1])

        strongbox = await get_info(ID)

        if strongbox is None:
            tx.write("Неверный ID\n".encode('utf-8'))
            return

        tx.write(f"r={strongbox[1]}\n"
                 f"g={strongbox[2]}\n"
                 f"ct={strongbox[3]}\n".encode('utf-8'))

    except:
        tx.write(f"Ошибка при получении :(\n".encode('utf-8'))
