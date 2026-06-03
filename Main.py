import math

class Circle:
    def __init__(self, radius):
        self.radius = radius

    def compute_area(self):
        return math.pi * (self.radius ** 2)

    def compute_perimeter(self):
        return 2 * math.pi * self.radius

if __name__ == "__main__":
    my_radius = 5
    circle = Circle(my_radius)
    
    area = circle.compute_area()
    perimeter = circle.compute_perimeter()
    
    print(f"Circle with radius: {my_radius}")
    print(f"Area: {area:.2f}")
    print(f"Perimeter: {perimeter:.2f}")