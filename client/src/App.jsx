import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Estimator from './pages/Estimator';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 py-12">
        <Routes>
          <Route path="/" element={<Estimator />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
