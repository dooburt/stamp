import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useMemo, useState } from 'react';
import UserContext from './context/userContext';
import Hello from './screens/Hello/Hello';
import './styles/app.css';

export default function App() {
  const [language, setLanguage] = useState('en');
  const [avatar, setAvatar] = useState(0);

  // this is where we'd get the user in future
  // const login = useCallback((response) => {
  //   storeCredentials(response.credentials);
  //   setCurrentUser(response.user);
  // }, []);

  const contextValue = useMemo(
    () => ({
      language,
      avatar,
      user: {},
      setAvatar,
      setLanguage,
    }),
    [language, avatar]
  );

  return (
    <>
      <div id="dragbar" className="absolute w-full h-8 bg-gray-500">
        <p className="text-white p-1 pl-4">Peekaboo</p>
      </div>
      <UserContext.Provider value={contextValue}>
        <Router>
          <Routes>
            <Route path="/" element={<Hello />} />
          </Routes>
        </Router>
      </UserContext.Provider>
    </>
  );
}
