students = {}

subjects = [
    "Math",
    "Science",
    "English",
    "History",
    "Language",
    "Religion",
    "Art",
    "Co-curricullum",
    "Sports"
]

def get_grade(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"

n = int(input("Enter number of students: "))

for i in range(n):
    name = input("\nEnter student name: ")

    if not name.isalpha():
        print("Invalid name! Only letters allowed.")
        continue

    students[name] = {}
    total = 0

    for subject in subjects:
        score_input = input("Enter score for " + subject + ": ")

        if not score_input.isdigit():
            print("Invalid score! Only numbers allowed.")
            continue

        score = int(score_input)
        students[name][subject] = score
        students[name][subject + "_grade"] = get_grade(score)
        total += score

    students[name]["Total"] = total
    students[name]["Average"] = total / len(subjects)

top_student = ""
bottom_student = ""
highest = -1
lowest = 9999

for name in students:
    total = students[name]["Total"]

    if total > highest:
        highest = total
        top_student = name

    if total < lowest:
        lowest = total
        bottom_student = name

print("\n--- RESULTS ---")

for name in students:
    print("\nStudent:", name)

    for subject in subjects:
        print(subject, ":", students[name][subject], "-", students[name][subject + "_grade"])

    print("Total:", students[name]["Total"])
    print("Average:", students[name]["Average"], "Grade:", get_grade(students[name]["Average"]))

print("\nTop Scorer:", top_student, "-", highest)
print("Bottom Scorer:", bottom_student, "-", lowest)

while True:
    search = input("\nEnter student name to search (or type 'exit'): ")

    if search == "exit":
        break

    if search in students:
        print("\nStudent:", search)
        for key, value in students[search].items():
            print(key, ":", value)
    else:
        print("Student not found")