import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

# Set visualization style
sns.set_theme(style="whitegrid")
plt.rcParams["figure.figsize"] = (10, 6)

# ==========================================
# 1. DATA CREATION (NUMPY & PANDAS)
# ==========================================
np.random.seed(42)
n_samples = 200

data = {
    "ID": np.arange(1001, 1001 + n_samples),
    "Age": np.random.randint(18, 65, size=n_samples),
    "Salary": np.random.normal(55000, 15000, size=n_samples).round(2),
    "Spending_Score": np.random.uniform(1, 100, size=n_samples).round(1),
    "Department": np.random.choice(
        ["Tech", "Sales", "Marketing", "HR"], size=n_samples
    ),
    "Performance": np.random.choice(
        ["Low", "Medium", "High"], size=n_samples, p=[0.2, 0.5, 0.3]
    ),
}

df = pd.DataFrame(data)

# Introduce a few missing values intentionally for cleanup demonstration
df.loc[df["Age"] < 22, "Salary"] = np.nan

# ==========================================
# 2. DATA CLEANING & INSPECTION (PANDAS)
# ==========================================
print("--- Initial Overview ---")
print(df.info())
print("\n--- Summary Statistics ---")
print(df.describe())

# Handle missing values: Fill NaN salaries with the median salary of the department
df["Salary"] = df.groupby("Department")["Salary"].transform(
    lambda x: x.fillna(x.median())
)

# Feature Engineering: Categorize Age into groups
bins = [17, 30, 45, 65]
labels = ["Young", "Mid-Career", "Senior"]
df["Age_Group"] = pd.cut(df["Age"], bins=bins, labels=labels)

# Filtering: High performers in Tech/Sales
high_performers = df[
    (df["Performance"] == "High") & (df["Department"].isin(["Tech", "Sales"]))
]

# Grouping & Aggregation
dept_summary = (
    df.groupby("Department")[["Salary", "Spending_Score"]]
    .mean()
    .reset_index()
)
print("\n--- Department Averages ---")
print(dept_summary)

# ==========================================
# 3. DATA VISUALIZATION (SEABORN & MATPLOTLIB)
# ==========================================
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle(
    "Capstone Project Data Analysis Dashboard", fontsize=16, fontweight="bold"
)

# Plot 1: Salary Distribution by Department (Seaborn Boxplot)
sns.boxplot(
    data=df, x="Department", y="Salary", hue="Department", ax=axes[0, 0], palette="Set2", legend=False
)
axes[0, 0].set_title("Salary Distribution across Departments")
axes[0, 0].set_ylabel("Salary ($)")

# Plot 2: Age vs. Spending Score (Seaborn Scatterplot)
sns.scatterplot(
    data=df,
    x="Age",
    y="Spending_Score",
    hue="Performance",
    size="Salary",
    sizes=(20, 200),
    ax=axes[0, 1],
    palette="viridis",
)
axes[0, 1].set_title("Age vs. Spending Score (by Performance & Salary)")

# Plot 3: Correlation Heatmap (NumPy/Pandas + Seaborn)
numeric_df = df.select_dtypes(include=[np.number]).drop(columns=["ID"])
sns.heatmap(
    numeric_df.corr(), annot=True, cmap="coolwarm", fmt=".2f", ax=axes[1, 0]
)
axes[1, 0].set_title("Numerical Feature Correlation Matrix")

# Plot 4: Department Headcount by Performance (Matplotlib/Seaborn Countplot)
sns.countplot(
    data=df, x="Department", hue="Performance", ax=axes[1, 1], palette="magma"
)
axes[1, 1].set_title("Employee Count by Department & Performance")

plt.tight_layout()
plt.show()