import datetime
import random


def random_hex(length, upper=False):
    hexchars = "0123456789abcdef"
    if upper:
        hexchars = hexchars.upper()

    result = ""
    for _ in range(length):
        result += hexchars[random.randint(0, len(hexchars) - 1)]
    return result


def clamp(val, minval, maxval):
    return max(min(val, maxval), minval)


def unix_timestamp(timestamp=None):
    if timestamp is None:
        timestamp = datetime.datetime.utcnow()
    return int((timestamp - datetime.datetime(1970, 1, 1)).total_seconds() * 1000)


def getval(dct, key, default=None):
    dct, subkey = getdict(dct, key)
    return dct.get(subkey, default)


def getdict(dct, key):
    spl = key.split(".")
    for i in range(0, len(spl) - 1):
        dct = dct[spl[i]]
    return dct, spl[-1]
