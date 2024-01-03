from Crypto.Util.number import *

import redis
import sympy
import random


def L(x,a):
    return (x-1)//a


def lucasV(n, p, q):
    if n == 0:
        return 2
    elif n == 1:
        return p
    elif n % 2 == 0:
        return lucasV(n // 2, p, q) ** 2 - 2 * pow(q, n // 2)
    else:
        return lucasV((n - 1) // 2, p, q) * lucasV((n + 1) // 2, p, q) - p * pow(q, (n - 1) // 2)


redis_connection = redis.StrictRedis(host='localhost', port=6379, db=0)
r=438698540895046059763624001586391356426809677083675118480749611796929229698263818346720853112954283
g=134438212242826823948890236474113008605278354649087399916869998475315217035622628110639976487817181231141731595522716512475884669004227635912784542364690829645077057502750072654192896752900439096674800545311453548653240157641184224368758550437116335203743481309986410493933967395
ct=12623801002547765385657097486272487683781499163671081941343460824251029835442386406961183433556015380094812105550348120832835592344214174234768747365927756243482337689486382778175237375375621292112155672766779673119835373944845252526694600762417696063980584946425528488829429055702

res = redis_connection.get(str(r))
print(res)

av = lucasV(435,1,-1)
bv = lucasV(472,1,-1)
a = sympy.prevprime(av)
b = sympy.nextprime(bv)

l1 = L(pow(ct,a-1,a*a),a)
l2 = L(pow(g,a-1,a*a),a)
l3 = inverse(l2,a)
m = l1*l3 % a
print(long_to_bytes(m))
