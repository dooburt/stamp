import React from 'react';

type User = {
  language: string;
  avatar: number;
  user: any;
  setAvatar: React.Dispatch<React.SetStateAction<number>>;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
};

const shell: User = {
  language: 'en',
  avatar: 0,
  user: {},
  setAvatar: () => {},
  setLanguage: () => {},
};

// set the defaults
const UserContext = React.createContext(shell);

export default UserContext;
