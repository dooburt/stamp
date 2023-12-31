/* eslint-disable no-unused-vars */
/* eslint-disable react/function-component-definition */
import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import { SpinnerCircular } from 'spinners-react';
import { mergeClasses } from '../../core/utils';

type ButtonProps = {
  styles?: any;
  loading?: boolean;
  classes?: string[];
  label: any;
  disabled?: boolean | undefined;
  handleClick?: (e: any) => void;
};

const Button: React.FC<ButtonProps> = ({
  styles,
  loading,
  classes,
  label,
  disabled,
  handleClick,
}) => {
  const bounce = {
    initial: { scale: 0.8 },
    animate: { scale: 1.0 },
    transition: { ease: 'easeIn', duration: 0.2 },
  };

  const mergedStyles = { ...styles };

  const handler = (event: any) => {
    console.log('handler');
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
            [
              'rounded-md',
              'p-2',
              'px-4',
              'bg-indigo-200',
              'text-indigo-300',
              'justify-center',
              'items-center',
              'flex',
            ],
            classes
          )
        )}
      >
        <SpinnerCircular
          size="24"
          color="#fff"
          secondaryColor="rgb(165 180 252)"
        />
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
      disabled={disabled}
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
  disabled: false,
  handleClick: () => {},
};

export default Button;
