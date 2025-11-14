/**
 * PatternAnalysis Component
 * Displays pattern analysis (even/odd, high/low, sequences, etc.)
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Target, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CHART_COLORS } from '../../constants/config';

const PatternAnalysis = React.memo(({ patternAnalysis }) => {
  if (!patternAnalysis) {
    return (
      <div className="text-center p-8 text-gray-500">
        Nenhum dado disponível para análise
      </div>
    );
  }

  // Prepare data for charts
  const parImparData = [
    { name: 'Par', value: patternAnalysis.parImpar.par, color: CHART_COLORS.blue },
    { name: 'Ímpar', value: patternAnalysis.parImpar.impar, color: CHART_COLORS.green },
  ];

  const baixoAltoData = [
    { name: 'Baixo (1-30)', value: patternAnalysis.baixoAlto.baixo, color: CHART_COLORS.purple },
    { name: 'Alto (31-60)', value: patternAnalysis.baixoAlto.alto, color: CHART_COLORS.yellow },
  ];

  // Most common distributions
  const distribuicaoEntries = Object.entries(patternAnalysis.distribuicao || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-bold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Total: <span className="font-semibold">{data.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-700">Soma Média</h4>
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{patternAnalysis.somaMedia}</p>
          <p className="text-xs text-gray-600 mt-1">Média das somas dos 6 números</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-700">Sequências</h4>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{patternAnalysis.sequencias}</p>
          <p className="text-xs text-gray-600 mt-1">{patternAnalysis.sequenciasPerc}% dos sorteios</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-700">Múltiplos de 5</h4>
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{patternAnalysis.multiplos5}</p>
          <p className="text-xs text-gray-600 mt-1">{patternAnalysis.multiplos5Perc}% dos sorteios</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-700">Padrões</h4>
            <Target className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {Object.keys(patternAnalysis.distribuicao || {}).length}
          </p>
          <p className="text-xs text-gray-600 mt-1">Distribuições diferentes</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Par/Ímpar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Distribuição Par/Ímpar
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={parImparData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {parImparData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Total de números: {patternAnalysis.parImpar.par + patternAnalysis.parImpar.impar}
            </p>
          </div>
        </div>

        {/* Baixo/Alto Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Distribuição Baixo/Alto
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={baixoAltoData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {baixoAltoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Total de números: {patternAnalysis.baixoAlto.baixo + patternAnalysis.baixoAlto.alto}
            </p>
          </div>
        </div>
      </div>

      {/* Most Common Distributions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Top 5 Distribuições Mais Comuns (Par/Ímpar)
        </h3>
        <div className="space-y-3">
          {distribuicaoEntries.map(([pattern, count], index) => {
            const percentage = ((count / Object.values(patternAnalysis.distribuicao).reduce((a, b) => a + b, 0)) * 100).toFixed(2);
            return (
              <div
                key={pattern}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{pattern}</p>
                    <p className="text-xs text-gray-600">
                      {pattern.split('/')[0]} números pares, {pattern.split('/')[1]} números ímpares
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-600">{percentage}% dos sorteios</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribution by Decades */}
      {patternAnalysis.distribuicaoDecadas && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Distribuição por Décadas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(patternAnalysis.distribuicaoDecadas).map(([decade, count]) => {
              const total = Object.values(patternAnalysis.distribuicaoDecadas).reduce((a, b) => a + b, 0);
              const percentage = ((count / total) * 100).toFixed(2);

              return (
                <div
                  key={decade}
                  className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4 text-center"
                >
                  <p className="text-sm font-semibold text-gray-700 mb-2">{decade}</p>
                  <p className="text-3xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-600 mt-1">{percentage}%</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Sobre padrões:</strong> Os padrões mostram tendências históricas, mas cada sorteio é independente.
          A distribuição mais comum é 3P/3I (3 pares e 3 ímpares), mas isso não garante resultados futuros.
        </p>
      </div>
    </div>
  );
});

PatternAnalysis.propTypes = {
  patternAnalysis: PropTypes.shape({
    parImpar: PropTypes.shape({
      par: PropTypes.number.isRequired,
      impar: PropTypes.number.isRequired,
    }).isRequired,
    baixoAlto: PropTypes.shape({
      baixo: PropTypes.number.isRequired,
      alto: PropTypes.number.isRequired,
    }).isRequired,
    distribuicao: PropTypes.object,
    sequencias: PropTypes.number.isRequired,
    multiplos5: PropTypes.number.isRequired,
    somaMedia: PropTypes.number.isRequired,
    sequenciasPerc: PropTypes.string.isRequired,
    multiplos5Perc: PropTypes.string.isRequired,
    distribuicaoDecadas: PropTypes.object,
  }),
};

PatternAnalysis.displayName = 'PatternAnalysis';

export default PatternAnalysis;
