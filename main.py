total_amount = float(input("Enter total bill amount: "))
paid_amount = float(input("Enter amount paid by customer: "))

if paid_amount < total_amount:
    due_amount = total_amount - paid_amount
    print("Due Amount =", due_amount)
else:
    print("No Due Amount")