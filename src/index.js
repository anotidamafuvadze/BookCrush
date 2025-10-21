import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import DashBoard from './pages/DashBoard.tsx';
import Login from './pages/Login.tsx';
import Swiping from './pages/Swiping.tsx';
import Register from './pages/Register.tsx';
import AuthGate from './components/AuthGate.tsx';
import WantToRead from './pages/WantToRead.tsx';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/want-to-read" element={<WantToRead />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <AuthGate>
            <DashBoard />
          </AuthGate>
        } />
        <Route path="/swiping" element={<Swiping />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);