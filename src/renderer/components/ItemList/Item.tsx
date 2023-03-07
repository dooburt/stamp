/* eslint-disable react/function-component-definition */
/* eslint-disable no-unused-vars */
import React from 'react';
import { motion } from 'framer-motion';
import { initialsGenerator, pickColor } from 'renderer/core/utils';

type ItemProps = {
  id: string;
  title: string;
  path: string;
  color?: string;
  onSelectItem: (id: string) => void;
  selected: boolean;
};

const Item: React.FC<ItemProps> = ({
  id,
  title,
  path,
  color,
  onSelectItem,
  selected,
}) => {
  const animation = {
    initial: { opacity: 0, transform: 'translateX(-40px)' },
    animate: { opacity: 1, transform: 'translateX(0px)' },
    transition: { ease: 'easeOut', duration: 1.1 },
  };

  const selectedColor = pickColor(color || 'yellow');
  const generatedInitials = initialsGenerator(title);
  const ifSelected = selected ? `bg-slate-100` : null;

  return (
    <motion.li
      initial={animation.initial}
      animate={animation.animate}
      transition={animation.transition}
      className={`my-1 w-full hover:bg-slate-200 rounded-md overflow-hidden ${ifSelected}`}
      onClick={() => onSelectItem(id)}
    >
      <div className="flex py-1">
        <div className="">
          <div
            className={`flex w-10 h-10 ${selectedColor.background} ${selectedColor.text} font-bold p-2 justify-center items-center m-2 rounded-lg`}
          >
            {generatedInitials}
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
  color: 'yellow',
};

export default Item;
