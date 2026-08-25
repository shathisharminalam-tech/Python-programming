import matplotlib.pyplot as plt
import seaborn as sns

# Set global theme and figure style
sns.set_theme(style="darkgrid")
plt.rcParams.update({"font.size": 10, "figure.autolayout": True})

# 1. Load the built-in dataset
tips = sns.load_dataset("tips")

# 2. Add derived feature: Tip Percentage
tips["tip_pct"] = (tips["tip"] / tips["total_bill"]) * 100

# 3. Create a 2x2 multi-panel visualization layout
fig, axes = plt.subplots(2, 2, figsize=(14, 10))
fig.suptitle(
    "Restaurant Customer Insights Explorer", fontsize=16, fontweight="bold"
)

# Chart 1: Violin Plot - Total Bill Distribution by Day & Gender
sns.violinplot(
    data=tips,
    x="day",
    y="total_bill",
    hue="sex",
    split=True,
    inner="quart",
    palette="Set2",
    ax=axes[0, 0],
)
axes[0, 0].set_title("Total Bill Distribution by Day & Sex")
axes[0, 0].set_ylabel("Total Bill ($)")

# Chart 2: Scatter Plot - Total Bill vs Tip by Party Size & Time
sns.scatterplot(
    data=tips,
    x="total_bill",
    y="tip",
    hue="time",
    style="sex",
    size="size",
    sizes=(30, 200),
    palette="deep",
    ax=axes[0, 1],
)
axes[0, 1].set_title("Tip Amount vs. Total Bill (by Party Size & Time)")
axes[0, 1].set_xlabel("Total Bill ($)")
axes[0, 1].set_ylabel("Tip ($)")

# Chart 3: Boxen Plot - Tip Percentage by Party Size
sns.boxenplot(
    data=tips, x="size", y="tip_pct", hue="sex", palette="coolwarm", ax=axes[1, 0]
)
axes[1, 0].set_title("Tip Percentage (%) by Party Size & Sex")
axes[1, 0].set_xlabel("Party Size")
axes[1, 0].set_ylabel("Tip Percentage (%)")

# Chart 4: Catplot Matrix - Average Bill by Day, Time & Smoker Status
sns.barplot(
    data=tips,
    x="day",
    y="total_bill",
    hue="smoker",
    estimator=sum,
    errorbar=None,
    palette="mako",
    ax=axes[1, 1],
)
axes[1, 1].set_title("Total Revenue by Day & Smoker Status")
axes[1, 1].set_ylabel("Total Revenue ($)")

plt.show()

# 4. Jointplot: Detailed relationship between Bill and Tip with Marginal Histograms
g = sns.jointplot(
    data=tips,
    x="total_bill",
    y="tip",
    hue="sex",
    kind="kde",
    fill=True,
    alpha=0.5,
    palette="Set1",
)
g.fig.suptitle(
    "KDE Density Distribution of Bills & Tips", y=1.02, fontweight="bold"
)
plt.show()