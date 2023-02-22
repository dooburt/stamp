/* eslint-disable no-console */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from 'renderer/components/Button/Button';
import ItemDisplay from 'renderer/components/ItemDisplay/ItemDisplay';
import ItemList from 'renderer/components/ItemList/ItemList';
import Navigation from 'renderer/components/Navigation/Navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import AddItemModal from 'renderer/components/AddItemModal/AddItemModal';

// todo: read the vault contents and return

function Dashboard() {
  const [addNewModalOpen, setAddNewModalOpen] = useState(true);

  const slideAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { ease: 'easeIn', duration: 0.6 },
  };

  const handleAddNewModalClose = () => {
    setAddNewModalOpen(!addNewModalOpen);
  };

  const renderLabel = () => {
    return (
      <>
        <FontAwesomeIcon icon={faPlus} className="text-white" />{' '}
        <span className="text-white pl-1">New Item</span>
      </>
    );
  };

  return (
    <>
      <div className="grid grid-cols-12 max-h-[1024px] h-screen w-full">
        <motion.div
          initial={slideAnimation.initial}
          animate={slideAnimation.animate}
          transition={slideAnimation.transition}
          className="flex col-span-3 justify-center bg-slate-800 border border-r-2 border-slate-100"
        >
          <div className="pt-8 pb-4 px-4 flex flex-col w-full">
            <div className="basis-10/12">
              <Navigation />
            </div>
            <div className="w-full">
              <Button
                label={renderLabel()}
                classes={[
                  'mt-8',
                  'h-12',
                  'w-full',
                  'bg-slate-600',
                  'hover:bg-purple-700/60',
                  'disabled:bg-gray-200',
                  'disabled:text-gray-500',
                ]}
                handleClick={handleAddNewModalClose}
              />
            </div>
          </div>
        </motion.div>
        <div className="flex col-span-9 w-full">
          <div className="grid grid-cols-12 w-full mt-8">
            <div className="flex col-span-5 h-screen bg-gray-100 overflow-y-scroll py-4 px-2 border border-r-2 border-slate-100">
              <ItemList />
            </div>
            <div className="flex col-span-7 h-screen overflow-y-scroll py-4 px-4">
              <ItemDisplay
                title="Sims Stuff"
                initials="SS"
                path="[..]/The Sims 4/Mods"
              />
            </div>
          </div>
        </div>
      </div>

      <AddItemModal open={addNewModalOpen} onClose={handleAddNewModalClose} />
    </>
  );
}

export default Dashboard;
