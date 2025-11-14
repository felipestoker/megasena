/**
 * FrequentPairs Component
 * Displays analysis of most frequent number pairs
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Users } from 'lucide-react';
import NumberBall from '../common/NumberBall';

const FrequentPairs = React.memo(({ frequentPairs }) => {
  if (!frequentPairs || frequentPairs.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Nenhum dado disponível para análise
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          Top 20 Pares Mais Frequentes
        </h3>
        <p className="text-sm text-gray-600">
          Duplas de números que mais aparecem juntas nos sorteios
        </p>
      </div>

      {/* Top 3 Highlight */}
      <div className="grid md:grid-cols-3 gap-4">
        {frequentPairs.slice(0, 3).map((item, index) => {
          const [num1, num2] = item.pair.split('-').map(Number);
          const medals = ['🥇', '🥈', '🥉'];
          const colors = [
            'from-yellow-50 to-yellow-100 border-yellow-300',
            'from-gray-50 to-gray-100 border-gray-300',
            'from-orange-50 to-orange-100 border-orange-300',
          ];

          return (
            <div
              key={item.pair}
              className={`bg-gradient-to-br ${colors[index]} border-2 rounded-xl p-6 text-center`}
            >
              <div className="text-4xl mb-3">{medals[index]}</div>
              <div className="flex justify-center gap-3 mb-4">
                <NumberBall number={num1} size="lg" variant="default" />
                <NumberBall number={num2} size="lg" variant="default" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{item.count} vezes</p>
              <p className="text-sm text-gray-600">{item.percentage}% dos sorteios</p>
            </div>
          );
        })}
      </div>

      {/* Full List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Todos os Pares Frequentes
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {frequentPairs.map((item, index) => {
            const [num1, num2] = item.pair.split('-').map(Number);

            return (
              <div
                key={item.pair}
                className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded-full text-xs font-bold">
                    #{index + 1}
                  </span>
                  <span className="text-xs text-gray-600">{item.percentage}%</span>
                </div>
                <div className="flex justify-center gap-2 mb-3">
                  <NumberBall number={num1} size="md" variant="default" />
                  <NumberBall number={num2} size="md" variant="default" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{item.count}</p>
                  <p className="text-xs text-gray-600">aparições juntos</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Par Mais Frequente</h4>
          <p className="text-2xl font-bold text-gray-900">{frequentPairs[0]?.pair}</p>
          <p className="text-xs text-gray-600 mt-1">{frequentPairs[0]?.count} vezes juntos</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Média de Aparições</h4>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(frequentPairs.reduce((sum, p) => sum + p.count, 0) / frequentPairs.length)}
          </p>
          <p className="text-xs text-gray-600 mt-1">entre os top 20</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Total de Pares Analisados</h4>
          <p className="text-2xl font-bold text-gray-900">1.770</p>
          <p className="text-xs text-gray-600 mt-1">combinações possíveis (60 × 59 / 2)</p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Importante:</strong> A frequência de pares no passado não aumenta a probabilidade de aparecerem juntos no futuro.
          Cada combinação tem a mesma chance em cada sorteio. Esta análise é puramente estatística e histórica.
        </p>
      </div>
    </div>
  );
});

FrequentPairs.propTypes = {
  frequentPairs: PropTypes.arrayOf(PropTypes.shape({
    pair: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    percentage: PropTypes.string.isRequired,
  })).isRequired,
};

FrequentPairs.displayName = 'FrequentPairs';

export default FrequentPairs;
