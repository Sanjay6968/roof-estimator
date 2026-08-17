import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Estimator from './pages/Estimator';
import Admin from './pages/Admin';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 py-12">
        <Routes>
          <Route path="/" element={<Estimator />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
