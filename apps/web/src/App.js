import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LeagueProvider } from './context/LeagueContext';
import Layout from './components/layout/Layout';
import ValueBets from './pages/ValueBets';
import Performance from './pages/Performance';
import Predictions from './pages/Predictions';
import PaperBets from './pages/PaperBets';
import HowItWorks from './pages/HowItWorks';

function App() {
  return (
    <LeagueProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<ValueBets />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/paper-bets" element={<PaperBets />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </LeagueProvider>
  );
}

export default App;
