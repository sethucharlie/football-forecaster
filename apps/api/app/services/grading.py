def grade_prediction(market: str, home_goals: int, away_goals: int) -> int:
    """
    Returns:
        1 if prediction wins
        0 if prediction loses
    """

    total_goals = home_goals + away_goals
    btts = home_goals > 0 and away_goals > 0

    # Over/Under markets
    if market.startswith("OU_"):
        parts = market.split("_")
        line = float(parts[1]) / 10  # OU_25_OVER -> 2.5
        side = parts[2]

        if side == "OVER":
            return 1 if total_goals > line else 0
        elif side == "UNDER":
            return 1 if total_goals < line else 0

    # BTTS markets
    if market == "BTTS_YES":
        return 1 if btts else 0

    if market == "BTTS_NO":
        return 1 if not btts else 0

    return 0