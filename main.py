age = int(input("Enter your age: "))

for i in range(1):
    if age >= 10:
        if age <= 20:
            print("Your age is between 10 and 20 ✅")
        else:
            print("Your age is above 20 ❌")
    else:
        print("Your age is below 10 ❌")
        