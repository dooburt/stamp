/* eslint-disable react/prop-types */
import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLockOpen, faLock } from '@fortawesome/free-solid-svg-icons';

export type StatusPillProps = {
  text: string;
};

const StatusPill: React.FC<StatusPillProps> = memo(({ text }) => {
  const renderLocked = () => {
    return (
      <div className="bg-emerald-400 p-1 px-2 rounded text-white inline-block">
        <FontAwesomeIcon icon={faLock} className="text-white mr-2" />
        {text.toUpperCase()}
      </div>
    );
  };

  const renderUnlocked = () => {
    return (
      <div className="bg-red-600 p-1 px-2 rounded text-white inline-block">
        <FontAwesomeIcon icon={faLockOpen} className="text-white mr-2" />
        {text.toUpperCase()}
      </div>
    );
  };

  return text === 'locked' ? renderLocked() : renderUnlocked();
});

export default StatusPill;
