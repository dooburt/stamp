/* eslint-disable no-console */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState } from 'react';
import EnterMasterPassword from 'renderer/components/EnterMasterPassword/EnterMasterPassword';
import Avatar from '../../components/Avatar/Avatar';
import Heading from '../../components/Heading/Heading';
import SetMasterPassword from '../../components/SetMasterPassword/SetMasterPassword';

function PreTouch() {
  return (
    <>
      <div className="flex flex-row mb-6">
        <Avatar />
        <div className="ml-4 mt-8">
          <Heading title="Hello there 👋" />
        </div>
      </div>
      <p className="text-slate-500">
        You're new here. To get started, we need to set a very good master
        password.
      </p>
      <SetMasterPassword />
    </>
  );
}

function Touched() {
  return (
    <>
      <div className="flex flex-row mb-6">
        <Avatar />
        <div className="ml-4 mt-8">
          <Heading title="Hey 👋" />
        </div>
      </div>
      <p className="text-slate-500">
        Welcome back. Enter your master password to access Peekaboo.
      </p>
      <EnterMasterPassword />
    </>
  );
}

function Hello() {
  const [hasStore, setHasStore] = useState(false);

  useEffect(() => {
    const sniffStore = async () => {
      const sniff = await window.electron.sniffStore();
      console.log('sniffed', sniff);
      setHasStore(sniff);
    };

    sniffStore();
  }, []);

  console.log('hasStore', hasStore);

  return (
    <div>
      <div className="grid grid-cols-12 min-h-screen w-full">
        <div className="flex col-span-4 justify-center bg-gray-100">&nbsp;</div>
        <div className="flex col-span-8 justify-center items-center w-128 m-auto">
          <div className="flex flex-col p-6 max-w-md justify-center">
            {hasStore ? Touched() : PreTouch()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hello;
