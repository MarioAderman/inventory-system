import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AddProduct from './pages/AddProduct';
import Purchases from './pages/Purchases';
import Sales from './pages/Sales';
import Consult from './pages/Consult';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/consult" element={<Consult />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
