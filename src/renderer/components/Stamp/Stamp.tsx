/* eslint-disable react/function-component-definition */
import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import { mergeClasses } from 'renderer/core/utils';

import stamp from '../../assets/postage.png';

type StampProps = {
  classes?: string[];
};

const Stamp: React.FC<StampProps> = ({ classes }) => {
  const slideAnimation = {
    initial: { opacity: 0, scale: 0.4 },
    animate: { opacity: 1, scale: 1.0 },
    transition: { ease: 'easeIn', duration: 0.4 },
  };

  return (
    <motion.div
      initial={slideAnimation.initial}
      animate={slideAnimation.animate}
      transition={slideAnimation.transition}
    >
      <img
        className={classNames(
          mergeClasses(['bg-contain', 'bg-no-repeat'], classes)
        )}
        src={stamp}
        alt="Stamp"
      />
    </motion.div>
  );
};

Stamp.defaultProps = {
  classes: [],
};

export default Stamp;
