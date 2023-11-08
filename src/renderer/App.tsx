/* eslint-disable object-shorthand */
/* eslint-disable react/jsx-no-constructed-context-values */
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';

import Hello from './screens/Hello/Hello';
import Mailbox from './screens/Mailbox/Mailbox';
import { Size, useWindowSize } from './core/hooks';
import Splash from './components/Splash/Splash';
import logo from './assets/postage.png';

import './styles/app.css';

export default function App() {
  const size: Size = useWindowSize();

  console.log('size', `${size.width}px / ${size.height}px`);

  return (
    <>
      <div id="dragbar" className="fixed z-10 w-full h-[31px] bg-slate-800">
        <img src={logo} alt="Stamp" width="20px" className="inline m-2" />
        <span className="text-white inline-block mt-1">Stamp</span>
      </div>
      <div className="h-screen overflow-hidden">
        <Router>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/mailbox" element={<Mailbox />} />
            <Route path="/hello" element={<Hello />} />
          </Routes>
        </Router>
      </div>
    </>
  );
}
