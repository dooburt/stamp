/* eslint-disable react/function-component-definition */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  humanFileSize,
  initialsGenerator,
  pickColor,
} from 'renderer/core/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PeekabooItem } from 'renderer/constants/app';
import { faLockOpen, faTrash } from '@fortawesome/free-solid-svg-icons';
import Button from '../Button/Button';
import Tooltip from '../Tooltip/Tooltip';
import ConfirmRemovalModal from '../ConfirmRemovalModal/ConfirmRemovalModal';

type ItemDisplayProps = {
  item: PeekabooItem;
  initials?: string;
  color?: string;
};

const ItemDisplay: React.FC<ItemDisplayProps> = ({ item, initials, color }) => {
  const [confirmRemovalModalOpen, setConfirmRemovalModalOpen] = useState(true);

  const animation = {
    initial: { opacity: 0, transform: 'translateX(-40px)' },
    animate: { opacity: 1, transform: 'translateX(0px)' },
    transition: { ease: 'easeOut', duration: 1.1 },
  };

  const handleConfirmRemovalModalClose = () => {
    setConfirmRemovalModalOpen(!confirmRemovalModalOpen);
  };

  const renderLabel = () => {
    return (
      <>
        <FontAwesomeIcon icon={faLockOpen} className="text-white" />{' '}
        <span className="text-white pl-1">Decrypt &amp; unlock</span>
      </>
    );
  };

  const renderDeleteLabel = () => {
    return (
      <>
        <FontAwesomeIcon icon={faTrash} className="text-white" />{' '}
        <span className="text-white pl-1">Decrypt &amp; remove</span>
      </>
    );
  };

  const selectedColor = pickColor(item.color || color || 'yellow');
  const generatedInitials = initialsGenerator(item.friendlyName) || initials;

  return (
    <motion.div
      initial={animation.initial}
      animate={animation.animate}
      transition={animation.transition}
      className="w-full"
    >
      <div className="flex mb-8">
        <div className="">
          <div
            className={`flex text-2xl w-14 h-14 ${selectedColor.background} ${selectedColor.text} font-bold p-2 justify-center items-center rounded-lg`}
          >
            {generatedInitials}
          </div>
        </div>
        <div className="flex-grow pt-2 pl-4">
          <span className="text-4xl leading-tight text-gray-800 block truncate">
            {item.friendlyName}
          </span>
        </div>
      </div>

      <div>
        <div className="px-2 py-2">
          <span className="block text-sm font-medium text-indigo-500">
            Friendly label
          </span>
          <div className="block text-sm text-gray-900">
            <Tooltip text="This is your label for the encrypted items">
              <span className="block text-sm font-normal dark:bg-gray-800 truncate">
                {item.friendlyName}
              </span>
            </Tooltip>
          </div>
        </div>
        <div className="px-2 py-2">
          <span className="block text-sm font-medium text-indigo-500">
            Secure name
          </span>
          <div className="block text-sm text-gray-900">
            <Tooltip text="Peekaboo stores all the items for this encryption in a 'boo' file named this.">
              <span className="block text-sm font-normal dark:bg-gray-800 truncate">
                {item.secureName}
              </span>
            </Tooltip>
          </div>
        </div>
        <div className="px-2 py-2">
          <span className="block text-sm font-medium text-indigo-500">
            Original location
          </span>
          <div className="block text-sm text-gray-900">
            <Tooltip text={item.originalLocation}>
              <span className="block text-sm font-normal dark:bg-gray-800 truncate">
                {item.originalLocation}
              </span>
            </Tooltip>
          </div>
        </div>
        <div className="px-2 py-2">
          <span className="block text-sm font-medium text-indigo-500">
            Peekaboo location
          </span>
          <div className="block text-sm text-gray-900">
            <Tooltip text={item.peekabooLocation}>
              <span className="block text-sm font-normal dark:bg-gray-800 truncate">
                {item.peekabooLocation}
              </span>
            </Tooltip>
          </div>
        </div>
        <div className="px-2 py-2">
          <span className="block text-sm font-medium text-indigo-500">
            Status
          </span>
          <div className="block text-sm text-gray-900">
            <span className="block text-sm font-normal dark:bg-gray-800 truncate">
              {item.status}
            </span>
          </div>
        </div>
        <div className="px-2 py-2">
          <span className="block text-sm font-medium text-indigo-500">
            Disk size
          </span>
          <div className="block text-sm text-gray-900">
            <span className="block text-sm font-normal dark:bg-gray-800 truncate">
              {humanFileSize(item.diskSize, true)}
            </span>
          </div>
        </div>
        <div className="px-2 py-2">
          <span className="block text-sm font-medium text-indigo-500">
            No. of items
          </span>
          <div className="block text-sm text-gray-900">
            <span className="block text-sm font-normal dark:bg-gray-800 truncate">
              {item.itemCount}
            </span>
          </div>
        </div>

        <div className="mb-2 mt-8">
          <Button
            label={renderLabel()}
            classes={[
              'h-12',
              'w-full',
              'bg-indigo-500',
              'hover:bg-indigo-700',
              'disabled:bg-gray-200',
              'disabled:text-gray-500',
            ]}
            handleClick={() => console.log('cobblers')}
          />
        </div>
        <div className="mb-8 mt-2">
          <Button
            label={renderDeleteLabel()}
            classes={[
              'h-12',
              'w-full',
              'bg-red-500',
              'hover:bg-red-700',
              'disabled:bg-gray-200',
              'disabled:text-gray-500',
            ]}
            handleClick={() => setConfirmRemovalModalOpen(true)}
          />
        </div>

        <div className="justify-center text-center pt-4">
          <span className="block text-xs text-slate-400">
            created: 30th January 2023 at 10:32:22
          </span>
          <span className="block text-xs text-slate-400">
            modified: 30th January 2023 at 10:32:22
          </span>
        </div>
      </div>

      <ConfirmRemovalModal
        open={confirmRemovalModalOpen}
        onClose={handleConfirmRemovalModalClose}
        // onComplete={triggerConfetti}
      />
    </motion.div>
  );
};

ItemDisplay.defaultProps = {
  initials: '??',
  color: 'yellow',
};

export default ItemDisplay;
