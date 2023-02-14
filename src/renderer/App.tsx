import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Hello from './screens/Hello/Hello';

import './styles/app.css';

export default function App() {
  return (
    <>
      <div id="dragbar" className="absolute w-full h-8 bg-gray-500">
        <p className="text-white p-1 pl-4">Peekaboo</p>
      </div>
      <Router>
        <Routes>
          <Route path="/" element={<Hello />} />
        </Routes>
      </Router>
    </>
  );
}
