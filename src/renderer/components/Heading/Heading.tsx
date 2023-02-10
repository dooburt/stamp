/* eslint-disable react/function-component-definition */
import React from 'react';
import { motion } from 'framer-motion';

type HeadingProps = {
  title: string;
};

const Heading: React.FC<HeadingProps> = ({ title }) => {
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
    >
      <h1 className="text-4xl">{title}</h1>
    </motion.div>
  );
};

export default Heading;
