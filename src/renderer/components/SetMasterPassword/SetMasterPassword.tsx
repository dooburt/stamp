import React, { useState } from 'react';
import Button from '../Button/Button';
import PasswordStrengthMeter from '../PasswordStrengthMeter/PasswordStrengthMeter';

function SetMasterPassword() {
  const [password, setPassword] = useState();

  const handleChange = (event: any) => {
    setPassword(event.target.value);
  };

  return (
    <div>
      <form className="mt-8 space-y-2" action="#" method="POST">
        <div className="flex flex-row">
          <input
            autoComplete="off"
            type="password"
            name="masterPassword"
            id="masterPassword"
            value={password}
            className="block w-full rounded-md border-2 p-2 border-indigo-500 focus:border-indigo-500 focus:ring-indigo-600 h-12 bg-gray-100"
            placeholder="Enter a new master password"
            onChange={handleChange}
          />
          <div className="ml-2">
            <Button label="Set" classes={['h-12']} />
          </div>
        </div>
        <PasswordStrengthMeter password={password} />
      </form>
    </div>
  );
}

export default SetMasterPassword;
