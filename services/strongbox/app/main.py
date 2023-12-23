import asyncio
import hashlib
import random

from strongbox import add, get
from db import connect_db


class CaptchaNotPassedException(Exception):
    pass


class GlobalHandler(object):
    def __init__(self, rx, tx):
        self.rx = rx
        self.tx = tx

    async def run(self):
        self.tx.write("Вам предоставлена возможность проверить самый надёжный криптосейф в мире. Мы гарантируем, что "
                      "вы можете поделиться любой секретной информацией и с вероятностью 146% к ней никто не получит "
                      "доступ даже после того, как вы поделитесь ею в зашифрованном виде.\n".encode('utf-8'))

        try:
            await self.captcha()
            line = await self.rx.readline()

            input_data = line.strip()

            await self.process_command(input_data)
            await self.tx.drain()

        except CaptchaNotPassedException:
            self.tx.write("Ошибка при решении капчи. Доступ запрещен.\n".encode('utf-8'))
            await self.tx.drain()
        except:
            self.tx.write(f"Что-то пошло не так :( \n".encode('utf-8'))

    async def process_command(self, input_data):
        args = input_data.decode().split(' ')
        command = args[0]

        if command == "add":
            if len(args) != 2:
                self.tx.write("добавьте что вы хотите положить в сейф\n".encode('utf-8'))
                return
            await add(self.tx, args)

        elif command == "get":
            if len(args) != 2:
                self.tx.write("добавьте какой сейф вы хотите открыть\n".encode('utf-8'))
                return
            await get(self.tx, args)
        else:
            self.tx.write("Такую услугу не оказываем\n".encode('utf-8'))

    async def captcha(self):
        try:
            a = random.randint(0, 300000)
            ct = hashlib.md5(str(a).encode()).hexdigest()
            self.tx.write(f"Решите капчу\n"
                          f"ct={ct}\n".encode('utf-8'))

            await self.tx.drain()

            user_answer = await self.rx.readline()
            user_answer = user_answer.decode()

            if int(user_answer) != a:
                raise ValueError("Неправильное решение")

            self.tx.write("Поздравляем! Вы успешно прошли капчу.\n".encode('utf-8'))
            await self.tx.drain()
        except:
            raise CaptchaNotPassedException("Ошибка при решении капчи")


async def handle_connection(reader, writer):
    s = GlobalHandler(reader, writer)
    await s.run()
    writer.close()
    await writer.wait_closed()


async def main():
    await connect_db()

    server = await asyncio.start_server(handle_connection, host="0.0.0.0", port="6666")

    async with server:
        await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())
