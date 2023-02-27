import React, { useEffect, useState } from 'react';
import { HEIGHT, WIDTH } from 'renderer/constants/app';

const useContainerDimensions = (
  ref: React.MutableRefObject<HTMLDivElement>
) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const getDimensions = () => ({
      width: ref.current?.offsetWidth || WIDTH,
      height: ref.current?.offsetHeight || HEIGHT,
    });

    const handleResize = () => {
      setDimensions(getDimensions());
    };

    if (ref.current) {
      setDimensions(getDimensions());
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [ref]);

  return { dimensions };
};

export default useContainerDimensions;
