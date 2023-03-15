import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import splash from '../../assets/splash/trans.png';
import back from '../../assets/splash/bg1.png';

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate('/hello');
    }, 3000);
  }, [navigate]);

  const slideAnimation = {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1.0 },
    transition: { ease: 'easeIn', duration: 0.6 },
  };

  return (
    <div
      className="min-w-screen min-h-screen w-screen h-screen"
      style={{ backgroundImage: `url(${back})`, backgroundSize: 'cover' }}
    >
      <motion.img
        initial={slideAnimation.initial}
        animate={slideAnimation.animate}
        transition={slideAnimation.transition}
        src={splash}
        alt="Peekaboo"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default Splash;
