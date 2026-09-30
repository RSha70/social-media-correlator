import math


def pearson_correlation(x: list[float], y: list[float]) -> float:
    if len(x) != len(y):
        raise ValueError("Both lists must have the same length.")

    if len(x) < 2:
        raise ValueError("At least two data points are required.")

    x_mean = sum(x) / len(x)
    y_mean = sum(y) / len(y)

    numerator = sum(
        (x[i] - x_mean) * (y[i] - y_mean)
        for i in range(len(x))
    )

    x_variance = sum(
        (value - x_mean) ** 2
        for value in x
    )

    y_variance = sum(
        (value - y_mean) ** 2
        for value in y
    )

    denominator = math.sqrt(x_variance * y_variance)

    if denominator == 0:
        return 0.0

    return numerator / denominator