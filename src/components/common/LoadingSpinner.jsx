/**
 * LoadingSpinner Component
 * Displays a loading spinner with optional progress information
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message, progress }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
      {message && (
        <p className="text-gray-600 text-center mb-2">{message}</p>
      )}
      {progress && progress.total > 0 && (
        <div className="w-full max-w-md">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Carregando concursos...</span>
            <span>{progress.current} / {progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            {Math.round((progress.current / progress.total) * 100)}% concluído
          </p>
        </div>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  progress: PropTypes.shape({
    current: PropTypes.number,
    total: PropTypes.number,
  }),
};

export default LoadingSpinner;
