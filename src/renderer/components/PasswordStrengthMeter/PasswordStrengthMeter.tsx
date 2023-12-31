/* eslint-disable no-unused-vars */
/* eslint-disable react/function-component-definition */
import React from 'react';
import { motion } from 'framer-motion';
import zxcvbn from 'zxcvbn';

type PasswordStrengthMeterProps = {
  password?: string;
  onChangeScore: (score: number) => void;
};

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  onChangeScore,
}) => {
  const animation = {
    initial: { opacity: 0, transform: 'translateX(-40px)' },
    animate: { opacity: 1, transform: 'translateX(0px)' },
    transition: { ease: 'easeOut', duration: 1.1 },
  };

  const testedScore = zxcvbn(password || '');

  const htmlTestedScore = (score: number) => {
    switch (score) {
      case 0:
        return { html: '0%', label: 'Weak', score: 0 };
      case 1:
        return { html: '25%', label: 'Poor', score: 1 };
      case 2:
        return { html: '50%', label: 'Could be better', score: 2 };
      case 3:
        return { html: '75%', label: 'Nearly', score: 3 };
      case 4:
        return { html: '100%', label: 'Lovely', score: 4 };
      default:
        return { html: '0%', label: 'Weak', score: 0 };
    }
  };

  const score = htmlTestedScore(testedScore.score);

  onChangeScore(score.score);

  return (
    <motion.div
      initial={animation.initial}
      animate={animation.animate}
      transition={animation.transition}
    >
      <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
        <div
          className="bg-indigo-500 h-1.5 rounded-full dark:bg-indigo-500"
          style={{ width: score.html }}
        >
          &nbsp;
        </div>
      </div>
      <span className="text-sm text-slate-500">{score.label}</span>
    </motion.div>
  );
};

PasswordStrengthMeter.defaultProps = {
  password: '',
};

export default PasswordStrengthMeter;
