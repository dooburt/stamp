import React, { useEffect, useState } from 'react';
import inbox from '../../assets/icons/inbox.png';
import Avatar from '../Avatar/Avatar';

function Navigation() {
  const [user, setUser] = useState({
    name: '',
  });

  useEffect(() => {
    const getUser = async () => {
      const u = await window.electron.getUser();
      console.log('user', u);
      setUser(u);
    };

    getUser();
  }, []);

  return (
    <>
      <div className="flex flex-row w-full mt-2 pl-2 pt-4 pb-4 hover:bg-purple-700/40 rounded">
        <div>
          <Avatar classes={['w-12', 'h-12']} />
        </div>
        <div className="pl-4 pt-5">
          <span className="text-white block text-lg leading-3">
            {user.name}
          </span>
        </div>
      </div>
      <div className="py-4">
        <ul>
          <li className="text-white bg-purple-700/40 rounded p-2">
            <img
              src={inbox}
              alt="All items"
              width="20px"
              className="inline m-2"
            />{' '}
            All items
          </li>
        </ul>
      </div>
    </>
  );
}

export default Navigation;
