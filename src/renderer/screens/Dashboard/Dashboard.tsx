/* eslint-disable no-console */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-unescaped-entities */
import { motion } from 'framer-motion';
import Splashback from 'renderer/components/Splashback/Splashback';
import { HEIGHT } from 'renderer/constants/app';
import ItemTable from 'renderer/components/ItemTable/ItemTable';
import Heading from 'renderer/components/Heading/Heading';
import Button from 'renderer/components/Button/Button';

function Dashboard() {
  const slideAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { ease: 'easeIn', duration: 0.6 },
  };

  return (
    <div className="grid grid-cols-12 min-h-screen h-full w-full">
      <motion.div
        initial={slideAnimation.initial}
        animate={slideAnimation.animate}
        transition={slideAnimation.transition}
        className="flex col-span-1 justify-center bg-gray-100 -z-20 border border-r-2 border-slate-100"
      >
        <Splashback />
      </motion.div>
      <div className="flex col-span-11 w-full mt-10 flex-col">
        <div className="flex justify-between">
          <Heading
            title="Your encrypted items"
            classes={['w-full', 'mb-10', 'ml-4', 'mt-4']}
          />

          <div className="flex gap-x-3 mr-4 mt-2">
            <Button
              label="Add"
              classes={[
                'h-12',
                'w-[71px]',
                'hover:cursor-pointer',
                'disabled:bg-gray-200',
                'disabled:text-gray-500',
              ]}
            />
          </div>
        </div>
        <ItemTable />
        {/* <section className="py-10 bg-gray-100 h-full">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <Card />
            <Card />
            <Card />
          </div>
        </section> */}
      </div>
    </div>
  );
}

export default Dashboard;
