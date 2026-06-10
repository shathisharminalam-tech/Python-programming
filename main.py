class Book:
    def __init__(self, title, author):
        self.title = title
        self.author = author
        self.is_borrowed = False

    def borrow(self):
        if not self.is_borrowed:
            self.is_borrowed = True
            print(f"Success: You have borrowed '{self.title}' by {self.author}.")
        else:
            print(f"Sorry: '{self.title}' is already borrowed.")

    def return_book(self):
        if self.is_borrowed:
            self.is_borrowed = False
            print(f"Success: '{self.title}' has been successfully returned.")
        else:
            print(f"Notice: '{self.title}' was not checked out.")


book1 = Book("The Hobbit", "J.R.R. Tolkien")
book2 = Book("1984", "George Orwell")
book3 = Book("To Kill a Mockingbird", "Harper Lee")

print("--- Library System Test ---")

book1.borrow()
book1.borrow()

print("\n--- Testing Book 2 ---")
book2.borrow()
book2.return_book()

print("\n--- Testing Book 3 ---")
book3.return_book()