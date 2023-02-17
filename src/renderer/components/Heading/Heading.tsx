/* eslint-disable react/function-component-definition */
import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import { mergeClasses } from 'renderer/core/utils';

type HeadingProps = {
  title: string;
  classes?: string[];
};

const Heading: React.FC<HeadingProps> = ({ title, classes }) => {
  const animation = {
    initial: { opacity: 0, transform: 'translateY(-40px)' },
    animate: { opacity: 1, transform: 'translateY(0px)' },
    transition: { ease: 'easeOut', duration: 1.1 },
  };

  return (
    <motion.div
      initial={animation.initial}
      animate={animation.animate}
      transition={animation.transition}
      className={classNames(mergeClasses([], classes))}
    >
      <h1 className="text-4xl">{title}</h1>
    </motion.div>
  );
};

Heading.defaultProps = {
  classes: [],
};

export default Heading;
