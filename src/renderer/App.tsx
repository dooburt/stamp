import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';

import Dashboard from './screens/Dashboard/Dashboard';
import Hello from './screens/Hello/Hello';

import './styles/app.css';

export default function App() {
  return (
    <>
      <div id="dragbar" className="fixed z-10 w-full h-[31px] bg-gray-500">
        <p className="text-white p-1 pl-4">Peekaboo</p>
      </div>
      <div className="h-full">
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
