#!/usr/bin/env python3
import random

import redis
import sympy
from pwn import *

OK, CORRUPT, MUMBLE, DOWN = 101, 102, 103, 104
port = 6666

redis_connection = redis.StrictRedis(host='localhost', port=6379, db=0)


def lucasV(n, p, q):
    if n == 0:
        return 2
    elif n == 1:
        return p
    elif n % 2 == 0:
        return lucasV(n // 2, p, q) ** 2 - 2 * pow(q, n // 2)
    else:
        return lucasV((n - 1) // 2, p, q) * lucasV((n + 1) // 2, p, q) - p * pow(q, (n - 1) // 2)


def L(x,a):
    return (x-1)//a


def close(code):
    print('Exit with code {}'.format(code), file=sys.stderr)
    exit(code)


def send_msg(socket, msg) -> str:
    socket.send(f'{msg}\n'.encode())
    return socket.recvline().decode('utf8')


cmd = sys.argv[1]


def check():
    ip = sys.argv[2]
    try:
        s = remote(ip, port, timeout=5)
        s.close()
        close(OK)
    except Exception as e:
        print(str(e))
        close(DOWN)


def get():
    ip = sys.argv[2]
    flag_id = sys.argv[3]
    flag = sys.argv[4]

    try:
        s = remote(ip, port)
        s.recvline()
        s.recvline()
        res3 = s.recvline()
        captcha_hash = str(res3).split("ct=")[1][:-3]
        answer = 0
        for i in range(0, 300000):
            if hashlib.md5(str(i).encode()).hexdigest() == captcha_hash:
                answer = i
        send_msg(s, answer)
        res = send_msg(s, f"get {flag_id}")
        r = int(res.split('r=')[1].split('\n')[0])
        g = int(res.split('g=')[1].split('\n')[0])
        ct = int(res.split('ct=')[1].split('\n')[0])

        if not redis_connection.exists(r):
            print("bad params return")
            close(CORRUPT)

        res = str(redis_connection.get(r)).split(",")
        aV = res[0]
        bV = res[1]

        a = sympy.prevprime(aV)
        b = sympy.nextprime(bV)

        a = min(a, b)
        b = max(a, b)
        n = a * a * b

        h = pow(g, n, n)

        g2 = random.randint(1,n)
        our_ct = (pow(g, flag, n) * pow(h, g2, n)) % n
        if L(pow(our_ct, a-1,a*a),a) != L(pow(ct, a - 1, a * a), a):
            print("bad params return")
            close(CORRUPT)

        close(OK)
    except Exception as e:
        print(str(e))
        close(MUMBLE)


def put():
    ip = sys.argv[2]
    flag = sys.argv[4]

    try:
        s = remote(ip, port)
        s.settimeout(5)
        s.recvline()
        s.recvline()
        res3 = s.recvline()
        captcha_hash = str(res3).split("ct=")[1][:-3]
        answer = 0
        for i in range(0, 300000):
            if hashlib.md5(str(i).encode()).hexdigest() == captcha_hash:
                answer = i
        res = send_msg(s, answer)
        if 'Ошибка' in res:
            print("bad captcha")
            close(CORRUPT)
        res = send_msg(s, "add " + flag)
        if not 'ID' in res:
            print("bad add")
            close(CORRUPT)

        id = res.split('а: ')[1]
        flag_id = id
        print(flag_id)
        close(OK)
    except Exception as e:
        print(str(e))
        close(MUMBLE)


if __name__ == "__main__":
    if cmd == 'check':
        check()
    elif cmd == 'get':
        get()
    elif cmd == 'put':
        put()
    elif cmd == 'info':
        print('1')

