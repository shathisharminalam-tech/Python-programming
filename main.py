d = {'a': 1, 'b': 2, 'c': 1, 'd': 3, 'e': 2}

freq = {}

for value in d.values():
    if value in freq:
        freq[value] += 1
    else:
        freq[value] = 1

print(freq)
