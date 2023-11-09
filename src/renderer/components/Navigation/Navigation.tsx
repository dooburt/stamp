// import React, { useEffect, useState } from 'react';
import inbox from '../../assets/icons/inbox.png';
import Avatar from '../Avatar/Avatar';

function Navigation() {
  // const [user, setUser] = useState({
  //   name: '',
  // });

  // useEffect(() => {
  //   const getUser = async () => {
  //     const u = await window.electron.getUser();
  //     console.log('user', u);
  //     setUser(u);
  //   };

  //   getUser();
  // }, []);

  return (
    <div className="py-4">
      <ul>
        <li className="text-white bg-purple-700/40 rounded p-2">Home</li>
        <li className="text-white rounded p-2">Inbox</li>
        <li className="text-white rounded p-2">Pins</li>
        <li className="text-white rounded p-2">Sent</li>
        <li className="text-white rounded p-2">Trash</li>
        <li className="text-white rounded p-2">Drafts</li>
      </ul>
      <h3>Folders</h3>
      <ul>
        <li className="text-white p-2">Archive</li>
        <li className="text-white p-2">dooburt@gmail.com</li>
      </ul>
      <div className="">
        <ul>
          <li className="text-white bg-purple-700/40 p-2">Update available</li>
          <li className="text-white p-2">Settings</li>
        </ul>
      </div>
    </div>
  );
}

export default Navigation;
