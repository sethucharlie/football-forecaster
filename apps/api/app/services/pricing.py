def mock_model_probability(market: str) -> float:
    """
    Temporary placeholder until we build the real Poisson model.
    """
    defaults = {
        "OU_15_OVER": 0.72,
        "OU_15_UNDER": 0.28,
        "OU_25_OVER": 0.55,
        "OU_25_UNDER": 0.45,
        "OU_35_OVER": 0.32,
        "OU_35_UNDER": 0.68,
        "BTTS_YES": 0.56,
        "BTTS_NO": 0.44,
    }
    return defaults.get(market, 0.50)


def implied_probability_from_odds(odds_decimal: float) -> float:
    return 1.0 / odds_decimal


def compute_edge(model_probability: float, implied_probability: float) -> float:
    return model_probability - implied_probability


def compute_ev_decimal_odds(model_probability: float, odds_decimal: float, stake: float = 1.0) -> float:
    """
    EV for decimal odds:
      profit_if_win = stake * (odds - 1)
      EV = p*profit_if_win - (1-p)*stake
    """
    profit_if_win = stake * (odds_decimal - 1.0)
    return (model_probability * profit_if_win) - ((1.0 - model_probability) * stake)