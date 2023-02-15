import React from 'react';
import { motion } from 'framer-motion';
import { shuffle } from 'renderer/core/utils';

import { splashbacks } from 'renderer/constants/splashbacks';

const getRandomSplashback = () => {
  const random = shuffle(splashbacks)[2];
  // const random = splashbacks.find((splash) => splash.id === 2);
  return random;
};

function Splashback() {
  const slideAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { ease: 'easeIn', duration: 0.4 },
  };

  return (
    <motion.div
      initial={slideAnimation.initial}
      animate={slideAnimation.animate}
      transition={slideAnimation.transition}
      className="w-full h-full -z-10"
    >
      <div
        className="bg-cover bg-no-repeat w-full h-full"
        style={{ backgroundImage: `url(${getRandomSplashback().asset})` }}
      >
        &nbsp;
      </div>
    </motion.div>
  );
}

export default Splashback;
