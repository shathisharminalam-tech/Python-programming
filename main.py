actual_cost = float(input("Enter the actual product price: "))
sale_amount = float(input("Enter the selling price: "))

difference = sale_amount - actual_cost

if difference > 0:
    print("You made a Profit of:", difference)
elif difference < 0:
    print("You made a Loss of:", abs(difference))
else:
    print("No Profit, No Loss!")