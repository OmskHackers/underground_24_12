import random
import sympy

from Crypto.Util.number import *

blacklist_index_a = [404, 421, 427, 451, 452, 458, 467, 470, 475]
blacklist_index_b = [409, 414, 415, 420, 425, 439, 448, 465, 493]


def encrypt(m):
    m = bytes_to_long(m.encode('utf-8'))

    index_a = random.randint(400, 500)
    while index_a in blacklist_index_a:
        index_a = random.randint(400, 500)

    index_b = random.randint(400, 500)
    while index_b in blacklist_index_b:
        index_b = random.randint(400, 500)

    aV = lucasV(index_a, 1, -1)
    bV = lucasV(index_b, 1, -1)

    a = sympy.prevprime(aV)
    b = sympy.nextprime(bV)
    
    a = min(a,b)
    b = max(a,b)
    n = a*a*b
    
    r = abs(aV-bV)

    g1 = random.randint(1, n)
    g2 = random.randint(1, n)

    h = pow(g1, n, n)

    ct = (pow(g1, m, n) * pow(h, g2, n)) % n

    return r, g1, ct


def lucasV(n, p, q):
    if n == 0:
        return 2
    elif n == 1:
        return p
    elif n % 2 == 0:
        return lucasV(n // 2, p, q) ** 2 - 2 * pow(q, n // 2)
    else:
        return lucasV((n - 1) // 2, p, q) * lucasV((n + 1) // 2, p, q) - p * pow(q, (n - 1) // 2)
