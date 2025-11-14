/**
 * DelayAnalysis Component
 * Displays delay/atraso analysis of lottery numbers
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Clock } from 'lucide-react';
import NumberBall from '../common/NumberBall';
import { DELAY_CATEGORIES } from '../../constants/config';

const DelayAnalysis = React.memo(({ delayAnalysis, topDelayed }) => {
  if (!delayAnalysis || delayAnalysis.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Nenhum dado disponível para análise
      </div>
    );
  }

  const categorizedDelays = {
    delayed: delayAnalysis.filter(d => d.classification === 'atrasado'),
    medium: delayAnalysis.filter(d => d.classification === 'médio'),
    recent: delayAnalysis.filter(d => d.classification === 'recente'),
  };

  return (
    <div className="space-y-6">
      {/* Top Delayed Numbers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-red-600" />
          Top 30 Números Mais Atrasados
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {topDelayed.map((item) => {
            const bgColor =
              item.classification === 'atrasado' ? 'from-red-50 to-red-100 border-red-200' :
              item.classification === 'médio' ? 'from-yellow-50 to-yellow-100 border-yellow-200' :
              'from-green-50 to-green-100 border-green-200';

            const badgeColor =
              item.classification === 'atrasado' ? 'bg-red-200 text-red-800' :
              item.classification === 'médio' ? 'bg-yellow-200 text-yellow-800' :
              'bg-green-200 text-green-800';

            return (
              <div
                key={item.number}
                className={`bg-gradient-to-br ${bgColor} rounded-lg p-4 text-center border`}
              >
                <NumberBall number={item.number} size="lg" variant="default" />
                <p className="text-sm font-semibold text-gray-900 mt-2">
                  {item.delay} {item.delay === 1 ? 'concurso' : 'concursos'}
                </p>
                <span className={`inline-block mt-2 px-2 py-1 ${badgeColor} text-xs font-medium rounded`}>
                  {item.classification === 'atrasado' ? '⏰ Atrasado' :
                   item.classification === 'médio' ? '⏱️ Médio' :
                   '✅ Recente'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delay Categories */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Delayed */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Atrasados</h3>
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
              {categorizedDelays.delayed.length}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Mais de {DELAY_CATEGORIES.DELAYED.max === Infinity ? '15' : DELAY_CATEGORIES.DELAYED.max} concursos sem aparecer
          </p>
          <div className="flex flex-wrap gap-2">
            {categorizedDelays.delayed.slice(0, 15).map((item) => (
              <div
                key={item.number}
                className="flex flex-col items-center"
                title={`${item.delay} concursos`}
              >
                <NumberBall number={item.number} size="sm" variant="default" />
                <span className="text-xs text-gray-600 mt-1">{item.delay}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Medium */}
        <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Médios</h3>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
              {categorizedDelays.medium.length}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Entre {DELAY_CATEGORIES.MEDIUM.max === 15 ? '8 e 15' : '8'} concursos
          </p>
          <div className="flex flex-wrap gap-2">
            {categorizedDelays.medium.slice(0, 15).map((item) => (
              <div
                key={item.number}
                className="flex flex-col items-center"
                title={`${item.delay} concursos`}
              >
                <NumberBall number={item.number} size="sm" variant="default" />
                <span className="text-xs text-gray-600 mt-1">{item.delay}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent */}
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recentes</h3>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              {categorizedDelays.recent.length}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Até {DELAY_CATEGORIES.RECENT.max} concursos atrás
          </p>
          <div className="flex flex-wrap gap-2">
            {categorizedDelays.recent.slice(0, 15).map((item) => (
              <div
                key={item.number}
                className="flex flex-col items-center"
                title={`${item.delay} concursos`}
              >
                <NumberBall number={item.number} size="sm" variant="default" />
                <span className="text-xs text-gray-600 mt-1">{item.delay}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Importante:</strong> O atraso de um número não aumenta sua probabilidade de ser sorteado.
          Cada sorteio é independente e todos os números têm a mesma chance (1/60).
        </p>
      </div>
    </div>
  );
});

DelayAnalysis.propTypes = {
  delayAnalysis: PropTypes.arrayOf(PropTypes.shape({
    number: PropTypes.number.isRequired,
    delay: PropTypes.number.isRequired,
    classification: PropTypes.string.isRequired,
    color: PropTypes.string,
  })).isRequired,
  topDelayed: PropTypes.array.isRequired,
};

DelayAnalysis.displayName = 'DelayAnalysis';

export default DelayAnalysis;
