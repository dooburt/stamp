/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-console */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { SpinnerCircular } from 'spinners-react';
import Button from '../Button/Button';

function EnterMasterPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [exposed, setExposed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bad, setBad] = useState(false);

  const handleChange = (event: any) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async () => {
    if (!password) return null;
    setLoading(true);
    const auth = await window.electron.authenticate(password);
    if (!auth) {
      setLoading(false);
      setBad(true);
    } else {
      return navigate('/dashboard');
    }
  };

  const handleExposePassword = () => {
    setExposed(!exposed);
  };

  const renderEye = () => {
    return (
      <div className="absolute" style={{ left: '290px', top: '12px' }}>
        <FontAwesomeIcon
          icon={exposed ? faEye : faEyeSlash}
          className={`text-indigo-500 hover:cursor-pointer hover:text-indigo-600 ${
            bad ? 'text-red-600 hover:text-red-700' : ''
          }`}
          onClick={handleExposePassword}
        />
      </div>
    );
  };

  const renderArrow = () => {
    return <FontAwesomeIcon icon={faArrowRight} className="text-white" />;
  };

  const renderLoading = () => {
    return (
      <div>
        <SpinnerCircular
          size="24"
          color="#fff"
          secondaryColor="rgb(165 180 252)"
        />
        <span className="text-slate-500 animate-pulse">Just a moment...</span>
      </div>
    );
  };

  const renderBadPassword = () => {
    return (
      <div className="bg-red-100 p-2 rounded-md animate-wiggle">
        <span className="text-red-600">🤔 That's not right. Try again.</span>
      </div>
    );
  };

  return (
    <div>
      <div className="mt-8 space-y-2">
        {loading ? (
          renderLoading()
        ) : (
          <>
            {bad ? renderBadPassword() : null}
            <div className="flex flex-row relative">
              <input
                autoComplete="off"
                type={exposed ? 'text' : 'password'}
                name="masterPassword"
                id="masterPassword"
                value={password}
                className={`w-[320px] block rounded-md border-2 p-2 border-indigo-500 focus:border-indigo-500 focus:ring-indigo-600 outline-indigo-700 h-12 ${
                  bad ? 'animate-wiggle border-red-500' : ''
                }`}
                placeholder="Enter your master password"
                onChange={handleChange}
              />
              {renderEye()}
              <div className="ml-2">
                <Button
                  label={renderArrow()}
                  // disabled={disabled}
                  classes={[
                    'h-12',
                    'w-[71px]',
                    'hover:cursor-pointer',
                    'disabled:bg-gray-200',
                    'disabled:text-gray-500',
                  ]}
                  handleClick={() => handleSubmit()}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EnterMasterPassword;
