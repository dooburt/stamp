/* eslint-disable react/function-component-definition */
import React from 'react';
import classNames from 'classnames';
import { ReactComponent as Facebook } from '../../assets/providers/facebook.svg';
import { ReactComponent as Google } from '../../assets/providers/google.svg';
import { ReactComponent as LinkedIn } from '../../assets/providers/linkedin.svg';

type ProviderIconRendererProps = {
  provider: string;
  classes?: string[];
};

const ProviderIconRenderer: React.FC<ProviderIconRendererProps> = ({
  provider = 'google',
  classes = ['w-10', 'h-8'],
}) => {
  if (!provider) return null;
  if (provider === 'google') return <Google className={classNames(classes)} />;
  if (provider === 'facebook')
    return <Facebook className={classNames(classes)} />;
  if (provider === 'linkedin')
    return <LinkedIn className={classNames(classes)} />;
  return null;
};

ProviderIconRenderer.defaultProps = {
  classes: [],
};

export default ProviderIconRenderer;
