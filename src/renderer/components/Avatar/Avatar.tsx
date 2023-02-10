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
      <div className="relative w-24 h-24">
        <img
          className="rounded-full border border-gray-100 shadow-sm"
          src={avatar}
          alt="Your avatar"
        />
      </div>
    </motion.div>
  );
}

export default Avatar;
