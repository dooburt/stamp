/* eslint-disable no-console */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Splashback from 'renderer/components/Splashback/Splashback';

function Dashboard() {
  const slideAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { ease: 'easeIn', duration: 0.6 },
  };

  return (
    <div>
      <div className="grid grid-cols-12 min-h-screen w-full">
        <motion.div
          initial={slideAnimation.initial}
          animate={slideAnimation.animate}
          transition={slideAnimation.transition}
          className="flex col-span-4 justify-center bg-gray-100 -z-20 border border-r-2 border-slate-100"
        >
          <Splashback />
        </motion.div>
        <div className="flex col-span-8 justify-center items-center w-128 m-auto">
          <div className="flex flex-col p-6 max-w-md justify-center">
            Dashboard
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
