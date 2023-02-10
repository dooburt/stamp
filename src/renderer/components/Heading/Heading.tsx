/* eslint-disable react/function-component-definition */
import React from 'react';

type HeadingProps = {
  title: string;
};

const Heading: React.FC<HeadingProps> = ({ title }) => {
  return <h1 className="text-4xl">{title}</h1>;
};

export default Heading;
