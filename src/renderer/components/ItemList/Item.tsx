/* eslint-disable react/function-component-definition */
/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { pickColor } from 'renderer/core/utils';

type ItemProps = {
  title: string;
  initials?: string;
  path: string;
  color?: string;
};

const Item: React.FC<ItemProps> = ({ title, initials, path, color }) => {
  const animation = {
    initial: { opacity: 0, transform: 'translateX(-40px)' },
    animate: { opacity: 1, transform: 'translateX(0px)' },
    transition: { ease: 'easeOut', duration: 1.1 },
  };

  const selectedColor = pickColor(color || 'yellow');

  return (
    <motion.li
      initial={animation.initial}
      animate={animation.animate}
      transition={animation.transition}
      className="my-1 w-full hover:bg-slate-200 rounded-md"
    >
      <div className="flex py-1">
        <div className="">
          <div
            className={`flex w-10 h-10 ${selectedColor.background} ${selectedColor.text} font-bold p-2 justify-center items-center m-2 rounded-lg`}
          >
            {initials}
          </div>
        </div>
        <div className="flex-grow">
          <span className="text-lg text-gray-800 block">{title}</span>
          <span className="text-sm text-gray-400 block truncate">{path}</span>
        </div>
      </div>
    </motion.li>
  );
};

Item.defaultProps = {
  initials: '??',
  color: 'yellow',
};

export default Item;