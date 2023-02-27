import { motion } from 'framer-motion';
import empty from '../../assets/icons/empty-folder.png';

function ItemDisplayNonIdealState() {
  const animation = {
    initial: { opacity: 0, transform: 'translateX(-40px)' },
    animate: { opacity: 1, transform: 'translateX(0px)' },
    transition: { ease: 'easeOut', duration: 1.1 },
  };

  return (
    <motion.div
      initial={animation.initial}
      animate={animation.animate}
      transition={animation.transition}
      className="w-full"
    >
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col">
          <img src={empty} className="w-24" alt="Empty" />
        </div>
      </div>
    </motion.div>
  );
}

export default ItemDisplayNonIdealState;
