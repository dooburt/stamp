import { Auth } from 'firebase/auth';
import { createContext } from 'react';

type AppShell = {
  auth?: Auth;
};

const shell: AppShell = {};

const AppContext = createContext(shell);

export { AppShell };
export default AppContext;
