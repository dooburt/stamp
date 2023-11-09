/* eslint-disable import/order */
/* eslint-disable no-console */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Splashback from 'renderer/components/Splashback/Splashback';
import Heading from '../../components/Heading/Heading';
import ProviderList from 'renderer/components/ProviderList/ProviderList';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInGoogle } from '../../core/firebase';
import InitiatePayload from 'types/initiatePayload';
import UrlAvatar from 'renderer/components/UrlAvatar/UrlAvatar';
import { useNavigate } from 'react-router-dom';

function Hello() {
  const [ready, setReady] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState({
    photoURL: '',
    displayName: '',
    email: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { uid } = user;
        console.log('logged in', user);
        console.log('uid', uid);
        console.log('window.electron', window.electron);
        // todo: get rid of "sniffStore", auth is the switch
        // call a electron endpoint to "save" the user, also "save" the user here into context
        const payload: InitiatePayload = {
          ...user,
        };
        await window.electron.initiateUser(JSON.stringify(payload));
        setLoggedInUser({
          photoURL: user.photoURL || '',
          displayName: user.displayName || '',
          email: user.email || '',
        });
        setReady(true);

        setTimeout(() => {
          navigate('/mailbox');
        }, 3000);
      } else {
        console.log('logged out');
        setReady(false);
      }
    });
  }, []);

  const onProviderSelect = async () => {
    await signInGoogle();
  };

  function renderPreTouch() {
    return (
      <>
        <div className="flex flex-row mb-6">
          {/* <div className="relative rounded-full w-24 h-24 bg-contain">
            <Stamp classes={['w-24', 'h-24']} />
          </div> */}
          <div className="mt-8">
            <Heading title="Hello 👋" />
          </div>
        </div>
        <p className="text-slate-500">
          You're new here. To get started, let's login to your email provider.
        </p>
        <div className="mt-8">
          <ProviderList onProviderSelectHandler={onProviderSelect} />
        </div>
      </>
    );
  }

  function renderTouched() {
    return (
      <>
        <div className="flex flex-row mb-6">
          <div className="relative rounded-full w-24 h-24 bg-contain">
            <UrlAvatar
              url={loggedInUser.photoURL}
              classes={['w-24', 'h-24', 'rounded-full']}
            />
          </div>
          <div className="mt-2 ml-4">
            <Heading title={`Welcome back ${loggedInUser.displayName}`} />
          </div>
        </div>
        <p className="text-slate-500 animate-pulse">Just a moment...</p>
      </>
    );
  }

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
            {ready ? renderTouched() : renderPreTouch()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hello;
