/* eslint-disable no-shadow */
/* eslint-disable no-console */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from 'renderer/components/Button/Button';
import ItemDisplay from 'renderer/components/ItemDisplay/ItemDisplay';
import ItemList from 'renderer/components/ItemList/ItemList';
import Navigation from 'renderer/components/Navigation/Navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import AddItemModal from 'renderer/components/AddItemModal/AddItemModal';
import ItemDisplayNonIdealState from 'renderer/components/ItemDisplay/ItemDisplayNonIdealState';
import { isEmptyPeekaboo } from 'renderer/core/utils';
import { emptyPeekaboo, PeekabooItem } from 'renderer/constants/app';
// import SizedConfetti from 'renderer/components/SizedConfetti/SizedConfetti';

function Dashboard() {
  // const [_, forceUpdate] = useReducer((x) => x + 1, 0);
  const [addNewModalOpen, setAddNewModalOpen] = useState(true);
  const [files, setFiles] = useState([]);
  const [item, setItem] = useState<PeekabooItem>(emptyPeekaboo);
  // const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    const getPeekabooContents = async () => {
      const data = await window.electron.readPeekabooContents();
      console.log('get peekaboo data', data);
      setFiles(data);

      if (data && data.length > 0) {
        setItem(data[0]);
      }
    };

    getPeekabooContents();
  }, []);

  console.log('files', files);

  const slideAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { ease: 'easeIn', duration: 0.6 },
  };

  const handleAddNewModalClose = () => {
    setAddNewModalOpen(!addNewModalOpen);
  };

  // const triggerConfetti = () => {
  //   console.log('trigginer confetti', confetti);
  //   setConfetti(true);
  // };

  const handleSelectItem = (id: string) => {
    const selected = files.find((file: PeekabooItem) => file.id === id);
    setItem(selected || emptyPeekaboo);
  };

  const renderLabel = () => {
    return (
      <>
        <FontAwesomeIcon icon={faPlus} className="text-white" />{' '}
        <span className="text-white pl-1">New Item</span>
      </>
    );
  };

  console.log('item', item);

  return (
    <>
      <div className="grid grid-cols-12 max-h-[1024px] h-screen w-full">
        {/* <SizedConfetti run={confetti} onCompleteConfetti={setConfetti(false)} /> */}
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
            <div className="flex col-span-5 h-screen bg-gray-100 scrollbar-thin scrollbar-rounded-md scrollbar-thumb-slate-500 scrollbar-track-gray-100 overflow-y-scroll border border-r-2 border-slate-100">
              <ItemList
                list={files}
                onSelectItem={handleSelectItem}
                selectedItemId={item.id}
              />
            </div>
            <div className="flex col-span-7 h-screen scrollbar-thin scrollbar-rounded-md scrollbar-thumb-slate-500 scrollbar-track-gray-100 overflow-y-scroll py-4 px-4">
              {!isEmptyPeekaboo(item) ? (
                <ItemDisplay item={item} />
              ) : (
                <ItemDisplayNonIdealState />
              )}
            </div>
          </div>
        </div>
      </div>

      <AddItemModal
        open={addNewModalOpen}
        onClose={handleAddNewModalClose}
        // onComplete={triggerConfetti}
      />
    </>
  );
}

export default Dashboard;
