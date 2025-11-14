/**
 * StatCard Component
 * Displays a statistic card with icon, title, value, and optional subtitle
 */

import React from 'react';
import PropTypes from 'prop-types';

const StatCard = React.memo(({ icon: Icon, title, value, subtitle, color = 'green' }) => {
  const colorClasses = {
    green: 'from-green-50 to-green-100 border-green-200 text-green-600',
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-600',
    yellow: 'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-600',
    red: 'from-red-50 to-red-100 border-red-200 text-red-600',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-600',
    gray: 'from-gray-50 to-gray-100 border-gray-200 text-gray-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`${colorClasses[color]} p-3 rounded-lg`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
});

StatCard.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  color: PropTypes.oneOf(['green', 'blue', 'yellow', 'red', 'purple', 'gray']),
};

StatCard.displayName = 'StatCard';

export default StatCard;
