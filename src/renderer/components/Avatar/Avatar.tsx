/* eslint-disable react/function-component-definition */
import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import { shuffle, mergeClasses } from 'renderer/core/utils';

import { avatars } from 'renderer/constants/avatars';

type AvatarProps = {
  selected?: number | null;
  classes?: string[];
};

const getRandomAvatar = () => {
  const random = shuffle(avatars)[2];
  return random;
};

const getSelectedAvatar = (selection: number) => {
  const tar = avatars.find((a) => a.id === selection);
  return tar;
};

const Avatar: React.FC<AvatarProps> = ({ selected, classes }) => {
  // const { avatar } = useContext(UserContext);
  const slideAnimation = {
    initial: { opacity: 0, scale: 0.4 },
    animate: { opacity: 1, scale: 1.0 },
    transition: { ease: 'easeIn', duration: 0.4 },
  };

  const selection = selected ? getSelectedAvatar(selected) : getRandomAvatar();

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
        style={{ backgroundImage: `url(${selection.asset})` }}
      >
        &nbsp;
      </div>
    </motion.div>
  );
};

Avatar.defaultProps = {
  selected: null,
  classes: [],
};

export default Avatar;
