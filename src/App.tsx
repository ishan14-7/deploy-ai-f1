import React, { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { Architecture } from './pages/Architecture';

function App() {
  const [view, setView] = useState<'dashboard' | 'architecture'>('dashboard');

  return (
    <>
      {view === 'dashboard' ? (
        <div className="relative">
          <div className="absolute top-8 right-1/3 z-50">
             <button 
               onClick={() => setView('architecture')}
               className="border border-primary text-primary hover:bg-primary hover:text-white font-mono text-xs px-4 py-2 transition-all uppercase tracking-widest shadow-[0_0_10px_rgba(230,0,43,0.3)] bg-background/50 backdrop-blur"
             >
               SYSTEM ARCHITECTURE →
             </button>
          </div>
          <Dashboard />
        </div>
      ) : (
        <Architecture onBack={() => setView('dashboard')} />
      )}
    </>
  )
}

export default App
