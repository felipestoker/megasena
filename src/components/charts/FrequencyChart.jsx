/**
 * FrequencyChart Component
 * Displays a bar chart of number frequencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { CHART_COLORS } from '../../constants/config';

const FrequencyChart = React.memo(({ data, top = 10 }) => {
  const chartData = data.slice(0, top).map(item => ({
    number: String(item.number).padStart(2, '0'),
    frequency: item.count,
    percentage: parseFloat(item.percentage),
    color: item.color || CHART_COLORS.green,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold text-gray-900">Número {data.number}</p>
          <p className="text-sm text-gray-600">
            Frequência: <span className="font-semibold">{data.frequency}</span>
          </p>
          <p className="text-sm text-gray-600">
            Porcentagem: <span className="font-semibold">{data.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="number"
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#6b7280"
          style={{ fontSize: '12px' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          dataKey="frequency"
          name="Frequência"
          radius={[8, 8, 0, 0]}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

FrequencyChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    number: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    percentage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    color: PropTypes.string,
  })).isRequired,
  top: PropTypes.number,
};

FrequencyChart.displayName = 'FrequencyChart';

export default FrequencyChart;
