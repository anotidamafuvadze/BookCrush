import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import DashBoard from './pages/DashBoard.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import AuthGate from './components/AuthGate.tsx';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <AuthGate>
            <DashBoard />
          </AuthGate>
        } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);