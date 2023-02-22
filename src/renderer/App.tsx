import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';

import Dashboard from './screens/Dashboard/Dashboard';
import Hello from './screens/Hello/Hello';

import logo from './assets/eye.png';

import './styles/app.css';

export default function App() {
  return (
    <>
      <div id="dragbar" className="fixed z-10 w-full h-[31px] bg-slate-800">
        <img src={logo} alt="Peekaboo" width="20px" className="inline m-2" />
        <span className="text-white inline-block mt-1">Peekaboo</span>
      </div>
      <div className="h-screen overflow-hidden">
        <Router>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Hello />} />
          </Routes>
        </Router>
      </div>
    </>
  );
}
