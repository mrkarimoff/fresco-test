import React from 'react';
import PropTypes from 'prop-types';
import { Transition } from 'react-transition-group';
import anime from 'animejs';
import { getCSSVariableAsNumber } from '~/lib/ui/utils/CSSVariables';
import getAbsoluteBoundingRect from '../../utils/getAbsoluteBoundingRect';

const appear = () => ({
  opacity: {
    value: [0, 1],
    duration: getCSSVariableAsNumber('--animation-duration-standard-ms'),
    easing: 'easeInOutQuad',
  },
  scaleY: {
    value: [0, 1],
    duration: getCSSVariableAsNumber('--animation-duration-slow-ms'),
    easing: 'easeInOutQuad',
  },
});

const disappear = () => ({
  opacity: 0,
  scaleY: 0,
  margin: 0,
  maxHeight: 0,
  duration: getCSSVariableAsNumber('--animation-duration-standard-ms'),
});

const FolderTransition = ({ children, ...props }) => (
  <Transition
    mountOnEnter
    unmountOnExit
    timeout={getCSSVariableAsNumber('--animation-duration-slow-ms')}
    onEntering={(el) => {
      const { height } = getAbsoluteBoundingRect(el);

      anime({
        targets: el,
        elasticity: 0,
        easing: 'easeInOutQuad',
        maxHeight: {
          value: [0, `${height}px`],
          easing: 'easeInOutQuad',
          duration: getCSSVariableAsNumber('--animation-duration-standard-ms'),
        },
        ...appear(),
      });
    }}
    onExiting={(el) => {
      anime({
        targets: el,
        elasticity: 0,
        easing: 'easeInOutQuad',
        ...disappear(),
      });
    }}
    {...props}
  >
    {children}
  </Transition>
);

FolderTransition.propTypes = {
  children: PropTypes.any,
};

export default FolderTransition;
