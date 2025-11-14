/**
 * FrequencyAnalysis Component
 * Displays frequency analysis of lottery numbers
 */

import React from 'react';
import PropTypes from 'prop-types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import FrequencyChart from '../charts/FrequencyChart';
import NumberBall from '../common/NumberBall';

const FrequencyAnalysis = React.memo(({ numberFrequency, topFrequent, topRare }) => {
  if (!numberFrequency || numberFrequency.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Nenhum dado disponível para análise
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Top 10 Números Mais Frequentes
        </h3>
        <FrequencyChart data={topFrequent} top={10} />
      </div>

      {/* Top Frequent Numbers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-red-600" />
          Números Mais Sorteados
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {topFrequent.map((item) => (
            <div
              key={item.number}
              className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 text-center border border-red-200"
            >
              <NumberBall number={item.number} size="lg" variant="hot" />
              <p className="text-sm font-semibold text-gray-900 mt-2">
                {item.count} vezes
              </p>
              <p className="text-xs text-gray-600">
                {item.percentage}% dos sorteios
              </p>
              <span className="inline-block mt-2 px-2 py-1 bg-red-200 text-red-800 text-xs font-medium rounded">
                Quente 🔥
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Rare Numbers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-blue-600" />
          Números Menos Sorteados
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {topRare.map((item) => (
            <div
              key={item.number}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200"
            >
              <NumberBall number={item.number} size="lg" variant="cold" />
              <p className="text-sm font-semibold text-gray-900 mt-2">
                {item.count} vezes
              </p>
              <p className="text-xs text-gray-600">
                {item.percentage}% dos sorteios
              </p>
              <span className="inline-block mt-2 px-2 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded">
                Frio ❄️
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* All Numbers Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Todos os Números (1-60)
        </h3>
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
          {numberFrequency.map((item) => {
            const variant =
              item.classification === 'quente' ? 'hot' :
              item.classification === 'frio' ? 'cold' :
              'neutral';

            return (
              <div
                key={item.number}
                className="flex flex-col items-center gap-1 p-2 hover:bg-gray-50 rounded transition-colors"
                title={`${item.count} vezes (${item.percentage}%)`}
              >
                <NumberBall number={item.number} size="sm" variant={variant} />
                <span className="text-xs text-gray-600 font-medium">
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <NumberBall number={1} size="sm" variant="hot" />
            <span className="text-gray-600">Quente (acima da média)</span>
          </div>
          <div className="flex items-center gap-2">
            <NumberBall number={2} size="sm" variant="neutral" />
            <span className="text-gray-600">Neutro (na média)</span>
          </div>
          <div className="flex items-center gap-2">
            <NumberBall number={3} size="sm" variant="cold" />
            <span className="text-gray-600">Frio (abaixo da média)</span>
          </div>
        </div>
      </div>
    </div>
  );
});

FrequencyAnalysis.propTypes = {
  numberFrequency: PropTypes.arrayOf(PropTypes.shape({
    number: PropTypes.number.isRequired,
    count: PropTypes.number.isRequired,
    percentage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    classification: PropTypes.string,
    color: PropTypes.string,
  })).isRequired,
  topFrequent: PropTypes.array.isRequired,
  topRare: PropTypes.array.isRequired,
};

FrequencyAnalysis.displayName = 'FrequencyAnalysis';

export default FrequencyAnalysis;
