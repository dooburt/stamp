import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Hello from './components/Hello/Hello';
import './styles/app.css';

export default function App() {
  return (
    <>
      <div id="dragbar" className="absolute w-full h-8 bg-gray-500">
        &nbsp;
      </div>
      <Router>
        <Routes>
          <Route path="/" element={<Hello />} />
        </Routes>
      </Router>
    </>
  );
}
