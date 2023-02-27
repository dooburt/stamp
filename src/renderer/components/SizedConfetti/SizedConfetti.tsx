/* eslint-disable react/function-component-definition */
import React, { useRef } from 'react';
import ReactConfetti from 'react-confetti';
import { HEIGHT, WIDTH } from 'renderer/constants/app';
import useContainerDimensions from '../../core/hooks';

type SizedConfettiProps = {
  run: boolean;
  onCompleteConfetti: any;
};

const SizedConfetti: React.FC<SizedConfettiProps> = ({
  run,
  onCompleteConfetti,
}) => {
  const confettiRef: React.MutableRefObject<any> = useRef(null);
  const { dimensions } = useContainerDimensions(confettiRef);
  console.log('confetti w x h', dimensions.width, dimensions.height);
  return (
    <ReactConfetti
      width={dimensions.width === 0 ? WIDTH : dimensions.width}
      height={dimensions.height === 0 ? HEIGHT : dimensions.height}
      numberOfPieces={run ? 500 : 0}
      recycle={false}
      onConfettiComplete={(confetti) => {
        onCompleteConfetti(false);
        confetti?.reset();
      }}
      ref={confettiRef}
    />
  );
};

export default SizedConfetti;
