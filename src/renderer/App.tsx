import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import { library } from '@fortawesome/fontawesome-svg-core';
// import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import Hello from './components/Hello/Hello';
import './styles/app.css';

// import { faEye } from '@fortawesome/free-solid-svg-icons';
// import { fas } from '@fortawesome/free-solid-svg-icons';
// import { faTwitter, faFontAwesome } from '@fortawesome/free-brands-svg-icons'

// library.add(faEye, faEyeSlash);

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
