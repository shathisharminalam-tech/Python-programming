start = int(input("Enter starting number: "))
end = int(input("Enter ending number: "))

squares = []
even = []
odd = []

for i in range(start, end + 1):
    square = i ** 2
    squares.append(square)

    if square % 2 == 0:
        even.append(square)
    else:
        odd.append(square)

print("Square values:", squares)
print("Even squares:", even)
print("Odd squares:", odd)