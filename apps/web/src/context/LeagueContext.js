import React, { createContext, useContext, useState } from 'react';
import { DEFAULT_LEAGUE } from '../lib/leagues';

const LeagueContext = createContext();

export function LeagueProvider({ children }) {
  const [league, setLeague] = useState(DEFAULT_LEAGUE);

  return (
    <LeagueContext.Provider value={{ league, setLeague }}>
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague() {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }
  return context;
}
