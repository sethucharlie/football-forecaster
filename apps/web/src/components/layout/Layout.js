import React from 'react';
import Navbar from '../navigation/Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Navbar />
      <main className="p-[var(--spacing-lg)] max-w-7xl mx-auto flex-grow w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}
