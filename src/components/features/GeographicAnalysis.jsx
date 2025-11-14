/**
 * GeographicAnalysis Component
 * Displays geographic analysis of lottery draws
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { MapPin, TrendingUp, Award } from 'lucide-react';

const GeographicAnalysis = React.memo(({ geographicAnalysis }) => {
  const [viewMode, setViewMode] = useState('cities'); // 'cities' or 'states'

  if (!geographicAnalysis || geographicAnalysis.totalDrawsWithLocation === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Nenhum dado geográfico disponível
      </div>
    );
  }

  const { cities, states, totalDrawsWithLocation } = geographicAnalysis;

  // Sort cities and states by count
  const topCities = Object.entries(cities)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 20);

  const topStates = Object.entries(states)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-700">Total de Sorteios</h4>
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalDrawsWithLocation}</p>
          <p className="text-xs text-gray-600 mt-1">com informação de local</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-700">Cidades Diferentes</h4>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{Object.keys(cities).length}</p>
          <p className="text-xs text-gray-600 mt-1">que realizaram sorteios</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-700">Estados</h4>
            <Award className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{Object.keys(states).length}</p>
          <p className="text-xs text-gray-600 mt-1">UFs com sorteios</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('cities')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'cities'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🏙️ Por Cidades
          </button>
          <button
            onClick={() => setViewMode('states')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'states'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🗺️ Por Estados
          </button>
        </div>
      </div>

      {/* Cities View */}
      {viewMode === 'cities' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Top 20 Cidades com Mais Sorteios
          </h3>
          <div className="space-y-3">
            {topCities.map(([city, data], index) => {
              const barWidth = (data.count / topCities[0][1].count) * 100;

              return (
                <div key={city} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold text-sm min-w-[3rem] text-center">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900">{city}</p>
                        <p className="text-xs text-gray-600">
                          {data.totalWinners} ganhadores • {data.totalAccumulated} acumulados
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{data.count}</p>
                      <p className="text-xs text-gray-600">{data.percentage}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* States View */}
      {viewMode === 'states' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Ranking de Estados
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {topStates.map(([state, data], index) => {
              const barWidth = (data.count / topStates[0][1].count) * 100;

              return (
                <div
                  key={state}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-full font-bold text-sm">
                        #{index + 1}
                      </span>
                      <span className="text-2xl font-bold text-gray-900">{state}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{data.count}</p>
                      <p className="text-xs text-gray-600">{data.percentage}%</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ganhadores:</span>
                      <span className="font-semibold text-gray-900">{data.totalWinners}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Cidades:</span>
                      <span className="font-semibold text-gray-900">{data.cities.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
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
          <strong>📍 Sobre a análise geográfica:</strong> Os dados mostram onde os sorteios foram realizados e onde houve ganhadores.
          A localização do sorteio não influencia nos números sorteados, que são completamente aleatórios.
        </p>
      </div>
    </div>
  );
});

GeographicAnalysis.propTypes = {
  geographicAnalysis: PropTypes.shape({
    cities: PropTypes.object.isRequired,
    states: PropTypes.object.isRequired,
    totalDrawsWithLocation: PropTypes.number.isRequired,
  }),
};

GeographicAnalysis.displayName = 'GeographicAnalysis';

export default GeographicAnalysis;
