import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';

import Dashboard from './screens/Dashboard/Dashboard';
import Hello from './screens/Hello/Hello';
import { Size, useWindowSize } from './core/hooks';
import Splash from './components/Splash/Splash';
import ConsoleContainer from './components/ConsoleContainer/ConsoleContainer';
import logo from './assets/ghost.png';

import './styles/app.css';

export default function App() {
  const size: Size = useWindowSize();

  console.log('size', `${size.width}px / ${size.height}px`);

  return (
    <>
      <div id="dragbar" className="fixed z-10 w-full h-[31px] bg-slate-800">
        <img src={logo} alt="Peekaboo" width="20px" className="inline m-2" />
        <span className="text-white inline-block mt-1">Peekaboo</span>
      </div>
      <div className="h-screen overflow-hidden">
        <Router>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/hello" element={<Hello />} />
            <Route path="/console" element={<ConsoleContainer />} />
          </Routes>
        </Router>
      </div>
    </>
  );
}
