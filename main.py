import tkinter as tk
from tkinter import messagebox
from datetime import date

def calculate_age():
    try:
        day = int(entry_day.get())
        month = int(entry_month.get())
        year = int(entry_year.get())
        
        birth_date = date(year, month, day)
        today = date.today()
        
        if birth_date > today:
            messagebox.showerror("Error", "Birth date cannot be in the future!")
            return
            
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        
        label_result.config(text=f"Present Age: {age} years old", fg="#1e293b")
        
    except ValueError:
        messagebox.showerror("Invalid Input", "Please enter valid numbers for Day, Month, and Year.")

root = tk.Tk()
root.title("Age Calculator App")
root.geometry("380x300")
root.configure(bg="#f8fafc")

title_label = tk.Label(root, text="Age Calculator", font=("Arial", 18, "bold"), bg="#3b82f6", fg="white", pady=10)
title_label.grid(row=0, column=0, columnspan=2, sticky="ew")

root.columnconfigure(0, weight=1)
root.columnconfigure(1, weight=1)

label_day = tk.Label(root, text="Day (DD):", font=("Arial", 11), bg="#f8fafc")
label_day.grid(row=1, column=0, padx=15, pady=10, sticky="e")
entry_day = tk.Entry(root, font=("Arial", 11), width=10, bd=2, relief="groove")
entry_day.grid(row=1, column=1, padx=15, pady=10, sticky="w")

label_month = tk.Label(root, text="Month (MM):", font=("Arial", 11), bg="#f8fafc")
label_month.grid(row=2, column=0, padx=15, pady=10, sticky="e")
entry_month = tk.Entry(root, font=("Arial", 11), width=10, bd=2, relief="groove")
entry_month.grid(row=2, column=1, padx=15, pady=10, sticky="w")

label_year = tk.Label(root, text="Year (YYYY):", font=("Arial", 11), bg="#f8fafc")
label_year.grid(row=3, column=0, padx=15, pady=10, sticky="e")
entry_year = tk.Entry(root, font=("Arial", 11), width=10, bd=2, relief="groove")
entry_year.grid(row=3, column=1, padx=15, pady=10, sticky="w")

btn_calculate = tk.Button(root, text="Calculate Age", font=("Arial", 11, "bold"), bg="#10b981", fg="white", 
                          padx=10, pady=5, command=calculate_age, cursor="hand2")
btn_calculate.grid(row=4, column=0, columnspan=2, pady=15)

label_result = tk.Label(root, text="", font=("Arial", 14, "bold"), bg="#f8fafc")
label_result.grid(row=5, column=0, columnspan=2, pady=10)

root.mainloop()