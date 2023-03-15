/* eslint-disable react/function-component-definition */
import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import { mergeClasses } from 'renderer/core/utils';

import ghost from '../../assets/ghost.png';

type GhostProps = {
  classes?: string[];
};

const Ghost: React.FC<GhostProps> = ({ classes }) => {
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
        src={ghost}
        alt="Peekaboo"
      />
    </motion.div>
  );
};

Ghost.defaultProps = {
  classes: [],
};

export default Ghost;
