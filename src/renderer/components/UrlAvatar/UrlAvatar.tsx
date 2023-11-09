/* eslint-disable react/function-component-definition */
import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import { mergeClasses } from 'renderer/core/utils';

type UrlAvatarProps = {
  url: string;
  classes?: string[];
};

const UrlAvatar: React.FC<UrlAvatarProps> = ({ url, classes }) => {
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
      <div
        className={classNames(
          mergeClasses(['bg-contain', 'bg-no-repeat'], classes)
        )}
        style={{ backgroundImage: `url(${url})` }}
      >
        &nbsp;
      </div>
    </motion.div>
  );
};

UrlAvatar.defaultProps = {
  classes: [],
};

export default UrlAvatar;
