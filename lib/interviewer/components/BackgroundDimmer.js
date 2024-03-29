import React from 'react';
import { motion } from 'framer-motion';
import { getCSSVariableAsNumber } from '~/lib/ui/utils/CSSVariables';

const BackgroundDimmer = ({ clickHandler, children }) => {
  const slowDuration = getCSSVariableAsNumber('--animation-duration-slow-ms') / 1000;

  const variants = {
    normal: {
      opacity: 1,
      transition: {
        duration: slowDuration,
      },
    },
    expanded: {
      opacity: 0,
      transition: {
        duration: slowDuration,
      },
    },
  };

  return (
    <motion.div
      key="dimmer"
      variants={variants}
      className="dimmer"
      initial="expanded"
      exit="expanded"
      animate="normal"
      onClick={() => clickHandler()}
    >
      {children}
    </motion.div>
  );
};

export default BackgroundDimmer;
