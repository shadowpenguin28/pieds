import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPageB2C from './pages/LandingPageB2C';
import LandingPageB2B from './pages/LandingPageB2B';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-brand-dark text-brand-cream font-sans selection:bg-brand-mint/30">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPageB2C />} />
          <Route path="/business" element={<LandingPageB2B />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
