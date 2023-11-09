import { APPBAR_HEIGHT } from 'renderer/constants/app';
// import { useNavigate } from 'react-router-dom';
// import { Size, useWindowSize } from 'renderer/core/hooks';
import { motion } from 'framer-motion';
import Navigation from 'renderer/components/Navigation/Navigation';
// import Button from 'renderer/components/Button/Button';

function Mailbox() {
  // const size: Size = useWindowSize();
  // const navigate = useNavigate();

  // const itemListHeight = (size.height || 0) - APPBAR_HEIGHT;

  const slideAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { ease: 'easeIn', duration: 0.6 },
  };

  return (
    <div className="grid grid-cols-12 h-screen w-full">
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
        </div>
      </motion.div>
      <div className="flex col-span-9 w-full pt-9">mail items</div>
    </div>
  );
}

export default Mailbox;
