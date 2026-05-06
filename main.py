import calendar
import datetime

# Get current year
year = datetime.datetime.now().year

print("Months of the year:", year)
print()
for month in range(1, 13):
    print(calendar.month_name[month])