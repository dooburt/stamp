/* eslint-disable react/function-component-definition */
/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { pickColor } from 'renderer/core/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLockOpen, faFolder } from '@fortawesome/free-solid-svg-icons';
import Button from '../Button/Button';

type ItemDisplayProps = {
  title: string;
  initials?: string;
  path: string;
  color?: string;
};

const ItemDisplay: React.FC<ItemDisplayProps> = ({
  title,
  initials,
  path,
  color,
}) => {
  const animation = {
    initial: { opacity: 0, transform: 'translateX(-40px)' },
    animate: { opacity: 1, transform: 'translateX(0px)' },
    transition: { ease: 'easeOut', duration: 1.1 },
  };

  const renderLabel = () => {
    return (
      <>
        <FontAwesomeIcon icon={faLockOpen} className="text-white" />{' '}
        <span className="text-white pl-1">Unlock</span>
      </>
    );
  };

  const selectedColor = pickColor(color || 'yellow');

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
            {initials}
          </div>
        </div>
        <div className="flex-grow pt-2 pl-4">
          <span className="text-4xl leading-tight text-gray-800 block">
            {title}
          </span>
        </div>
      </div>

      <span className="block text-xs text-gray-800 mb-2 rounded-md truncate bg-slate-200 py-1 pl-3">
        <FontAwesomeIcon icon={faFolder} className="text-gray-600 mr-1" />
        <span>C:/Users/dooburt/Documents/Electronic Arts/The Sims 4/Mods</span>
      </span>

      <div className="mb-8 mt-8">
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

      <div>
        <div className="overflow-hidden bg-slate-200 rounded-md">
          <div className="border-t border-slate-200">
            <dl>
              <div className="bg-slate-200 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  <span className="inline text-sm font-normal text-emerald-500 dark:bg-gray-800">
                    Locked &amp; Secure
                  </span>
                </dd>
              </div>

              <div className="bg-slate-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-slate-700 sm:col-span-2 sm:mt-0">
                  Folder
                </dd>
              </div>
              <div className="bg-slate-200 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Size</dt>
                <dd className="mt-1 text-sm text-slate-700 sm:col-span-2 sm:mt-0">
                  12.5Gb
                </dd>
              </div>
              <div className="bg-slate-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Items</dt>
                <dd className="mt-1 text-sm text-slate-700 sm:col-span-2 sm:mt-0">
                  1,078
                </dd>
              </div>
            </dl>
          </div>
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
    </motion.div>
  );
};

ItemDisplay.defaultProps = {
  initials: '??',
  color: 'yellow',
};

export default ItemDisplay;
