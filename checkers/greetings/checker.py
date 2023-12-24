#!/usr/bin/env python3
import random
import string
import requests
import sys
from pathlib import Path
from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont
from io import BytesIO


def generator(size=12, chars=string.digits + string.ascii_letters):
    return ''.join(random.choice(chars) for _ in range(size))


OK, CORRUPT, MUMBLE, DOWN = 101, 102, 103, 104
port = 3000


def close(code):
    exit(code)


cmd = sys.argv[1]


def check():
    ip = sys.argv[2]
    url = f'http://{ip}:{port}'
    try:
        requests.get(url + '/login')
        close(OK)
    except Exception as e:
        print(str(e))
        close(DOWN)


def get():
    ip = sys.argv[2]
    flag_id = sys.argv[3]

    url = f'http://{ip}:{port}'
    checker_info = flag_id.split(':')

    img_id = checker_info[0]
    description = checker_info[1]
    session = checker_info[2]
    cookies = {'session': session}


    try:
        res = requests.get(url + f'/api/user/greeting/description/?id={img_id}', cookies=cookies)
        if 'error' in res.text:
            print("bad get description")
            close(CORRUPT)

        res_description = str(res.json()['description'])
        if res_description != description:
            print("bad get description")
            close(CORRUPT)

        res = requests.get(url + f'/api/user/greeting/file/?id={img_id}', cookies=cookies)
        start_bytes = bytearray(res.content[:10])
        description = description.encode()
        for i in range(0, 10):
            start_bytes[i] ^= description[i % len(description)]

        if not str(start_bytes).__contains__('PNG'):
            print("bad get image")
            close(CORRUPT)

        close(OK)
    except Exception as e:
        print(str(e))
        close(MUMBLE)


def put():
    ip = sys.argv[2]
    url = f'http://{ip}:{port}'

    username = generator()
    password = generator()

    flag = sys.argv[4]

    try:
        res = requests.post(url + '/api/auth/register', allow_redirects=False, json={
            'username': username,
            'password': password
        })

        if 'error' in res.text:
            print("bad register")
            close(CORRUPT)

        session = res.json()['message']['user']['session_value']
        cookies = {'session': session}

        if 'error' in res.text:
            print("bad login")
            close(CORRUPT)

        BASE_DIR = Path(__file__).absolute().resolve().parent
        image_local_path = BASE_DIR / 'white_image.png'

        image = Image.open(str(image_local_path))

        i = image.copy()

        BASE_DIR = Path(__file__).absolute().resolve().parent
        ttf_local_path = BASE_DIR / 'Arial.ttf'

        Im = ImageDraw.Draw(i)
        mf = ImageFont.truetype(str(ttf_local_path), 25)

        Im.text((15, 15), flag, (255, 0, 0), font=mf)

        image_buffer = BytesIO()
        image.save(image_buffer, format='PNG')

        files = {'image': (str(image_local_path), image_buffer.getvalue(), 'image/png')}

        description = generator()

        data = {
            'description': description
        }

        res = requests.post(url + '/api/user/greeting', data=data, files=files, cookies=cookies)

        if 'error' in res.text:
            print("bad upload file")
            close(CORRUPT)

        # img_id должно быть в аттак дате. остальное (description, session) - приватная для чекера
        img_id = str(res.json()['message']['id'])
        flag_id = img_id + ":" + description + ":" + session
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

