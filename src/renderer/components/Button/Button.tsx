/* eslint-disable no-unused-vars */
/* eslint-disable react/function-component-definition */
import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import { mergeClasses } from 'core/utils';

type ButtonProps = {
  styles?: any;
  loading?: boolean;
  classes?: string[];
  label: string;
  handleClick?: (e: any) => void;
};

const Button: React.FC<ButtonProps> = ({
  styles,
  loading,
  classes,
  label,
  handleClick,
}) => {
  const bounce = {
    initial: { scale: 0.8 },
    animate: { scale: 1.0 },
    transition: { ease: 'easeIn', duration: 0.2 },
  };

  const mergedStyles = { ...styles };

  const handler = (event: any) => {
    if (handleClick) handleClick(event);
    event.stopPropagation();
  };

  const renderLoading = () => {
    return (
      <motion.button
        style={styles}
        initial={bounce.initial}
        animate={bounce.animate}
        transition={bounce.transition}
        className={classNames(
          mergeClasses(
            ['rounded-md', 'p-2', 'px-4', 'bg-indigo-500', 'text-indigo-300'],
            classes
          )
        )}
      >
        {label}
      </motion.button>
    );
  };

  return loading ? (
    renderLoading()
  ) : (
    <motion.button
      style={mergedStyles}
      initial={bounce.initial}
      animate={bounce.animate}
      transition={bounce.transition}
      className={classNames(
        mergeClasses(
          [
            'rounded-md',
            'p-2',
            'px-4',
            'bg-indigo-500',
            'text-white',
            'hover:bg-indigo-600',
          ],
          classes
        )
      )}
      onClick={handler}
    >
      {label}
    </motion.button>
  );
};

Button.defaultProps = {
  styles: null,
  loading: false,
  classes: [],
  handleClick: () => {},
};

export default Button;
