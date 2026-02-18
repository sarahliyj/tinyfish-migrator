import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const apiUrl = process.env.REACT_APP_API_URL;

const Dashboard = React.lazy(() => import('./Dashboard'));

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header>
      <Helmet>
        <title>My CRA App</title>
      </Helmet>
      <nav>
        <button onClick={() => navigate('/home')}>Home</button>
        <span>Current: {location.pathname}</span>
      </nav>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/home" element={<div>Home</div>} />
        <Route path="/about" element={<div>About</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
