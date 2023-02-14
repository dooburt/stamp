import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Button from '../Button/Button';
import PasswordStrengthMeter from '../PasswordStrengthMeter/PasswordStrengthMeter';

function SetMasterPassword() {
  const [password, setPassword] = useState('');
  const [exposed, setExposed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [score, setScore] = useState(0);

  const handleChange = (event: any) => {
    setPassword(event.target.value);
  };

  const handleScore = (event: number) => {
    setScore(event);
    if (event >= 4) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  };

  const handleExposePassword = () => {
    setExposed(!exposed);
  };

  const handleSubmit = () => {
    if (!password) return null;
    setLoading(true);
    setDisabled(true);
    window.electron.createStore(password);
    return null;
  };

  const renderEye = () => {
    return (
      <div className="absolute" style={{ left: '290px', top: '12px' }}>
        <FontAwesomeIcon
          icon={exposed ? faEye : faEyeSlash}
          className="text-indigo-500 hover:cursor-pointer hover:text-indigo-600"
          onClick={handleExposePassword}
        />
      </div>
    );
  };

  const renderArrow = () => {
    return <FontAwesomeIcon icon={faArrowRight} className="text-white" />;
  };

  const disabledOrLoading = disabled || loading;

  return (
    <div>
      <div className="mt-8 space-y-2">
        <div className="flex flex-row relative">
          <input
            autoComplete="off"
            type={exposed ? 'text' : 'password'}
            disabled={loading}
            name="masterPassword"
            id="masterPassword"
            value={password}
            className="w-[320px] block rounded-md border-2 p-2 border-indigo-500 focus:border-indigo-500 focus:ring-indigo-600 outline-indigo-700 h-12"
            placeholder="Enter a new master password"
            onChange={handleChange}
          />
          {renderEye()}
          <div className="ml-2">
            <Button
              label={renderArrow()}
              disabled={disabledOrLoading}
              loading={loading}
              classes={[
                'h-12',
                'w-[71px]',
                'hover:cursor-pointer',
                'disabled:bg-gray-200',
                'disabled:text-gray-500',
              ]}
              handleClick={handleSubmit}
            />
          </div>
        </div>
        <PasswordStrengthMeter
          password={password}
          onChangeScore={handleScore}
        />
      </div>
    </div>
  );
}

export default SetMasterPassword;
