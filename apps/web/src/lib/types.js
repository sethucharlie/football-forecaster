/**
 * @typedef {Object} OddsItem
 * @property {string} market
 * @property {number} odds_decimal
 * @property {number} implied_probability
 * @property {number} model_probability
 * @property {number} edge
 * @property {number} expected_value
 */

/**
 * @typedef {Object} ValueBetFixture
 * @property {number} match_id
 * @property {string} league
 * @property {string} home_team
 * @property {string} away_team
 * @property {string} kickoff_utc
 * @property {string} status
 * @property {OddsItem[]} odds
 */

/**
 * @typedef {Object} MarketItem
 * @property {string} market
 * @property {number} lambda_home
 * @property {number} lambda_away
 * @property {number} odds_implied_probability
 * @property {number} model_probability
 * @property {number} edge
 * @property {number} ev
 */

/**
 * @typedef {Object} PredictionFixture
 * @property {number} match_id
 * @property {string} league
 * @property {string} home_team
 * @property {string} away_team
 * @property {string} kickoff_utc
 * @property {string} status
 * @property {string} model_version
 * @property {string} created_at
 * @property {MarketItem[]} markets
 */

/**
 * @typedef {Object} PaperBetsSummary
 * @property {number} total_bets
 * @property {number} total_staked
 * @property {number} total_profit
 * @property {number} roi
 * @property {number} win_rate
 * @property {number} avg_edge
 */

/**
 * @typedef {Object} EquityPoint
 * @property {string} date
 * @property {number} equity
 */

/**
 * @typedef {Object} PaperBet
 * @property {number} id
 * @property {number} match_id
 * @property {string} home_team
 * @property {string} away_team
 * @property {string} kickoff_utc
 * @property {string} market
 * @property {string} model_version
 * @property {number} odds_decimal
 * @property {number} model_probability
 * @property {number} implied_probability
 * @property {number} edge
 * @property {number} ev
 * @property {number} stake
 * @property {string} placed_at
 * @property {string|null} result
 * @property {number|null} profit
 * @property {string|null} settled_at
 */

/**
 * @typedef {Object} MarketPerformance
 * @property {string} market
 * @property {number} total_bets
 * @property {number} wins
 * @property {number} win_rate
 * @property {number} total_profit
 * @property {number} roi
 */
