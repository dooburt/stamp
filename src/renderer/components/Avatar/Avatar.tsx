import { motion } from 'framer-motion';
import avatar from '../../resources/avatars/sakura.png';

function Avatar() {
  const slideAnimation = {
    initial: { opacity: 0, scale: 0.4 },
    animate: { opacity: 1, scale: 1.0 },
    transition: { ease: 'easeIn', duration: 0.4 },
  };

  return (
    <motion.div
      initial={slideAnimation.initial}
      animate={slideAnimation.animate}
      transition={slideAnimation.transition}
    >
      <div className="relative rounded-full w-24 h-24 bg-contain bg-slate-200">
        <div
          className="w-24 h-24 bg-contain bg-no-repeat"
          style={{ backgroundImage: `url(${avatar})` }}
        >
          &nbsp;
        </div>
      </div>
    </motion.div>
  );
}

export default Avatar;
