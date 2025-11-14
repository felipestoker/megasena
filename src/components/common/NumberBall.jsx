/**
 * NumberBall Component
 * Displays a lottery number in a styled ball
 */

import React from 'react';
import PropTypes from 'prop-types';

const NumberBall = React.memo(({ number, size = 'md', variant = 'default' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-base',
    lg: 'w-14 h-14 text-lg',
  };

  const variantClasses = {
    default: 'bg-gradient-to-br from-green-500 to-green-600 text-white',
    hot: 'bg-gradient-to-br from-red-500 to-red-600 text-white',
    cold: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',
    neutral: 'bg-gradient-to-br from-gray-500 to-gray-600 text-white',
    megaVirada: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-gray-900',
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        rounded-full font-bold shadow-lg
        ${sizeClasses[size]}
        ${variantClasses[variant]}
      `}
    >
      {String(number).padStart(2, '0')}
    </span>
  );
});

NumberBall.propTypes = {
  number: PropTypes.number.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'hot', 'cold', 'neutral', 'megaVirada']),
};

NumberBall.displayName = 'NumberBall';

export default NumberBall;
