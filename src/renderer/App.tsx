import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Hello from './components/Hello/Hello';
import '../peekaboo.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
