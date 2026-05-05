import math

# Take input from user (in degrees)
angle = float(input("Enter angle in degrees: "))

# Convert degrees to radians
radian = math.radians(angle)

# Calculate trigonometric values
sin_value = math.sin(radian)
cos_value = math.cos(radian)
tan_value = math.tan(radian)

# Display results
print("Sin:", sin_value)
print("Cos:", cos_value)
print("Tan:", tan_value)