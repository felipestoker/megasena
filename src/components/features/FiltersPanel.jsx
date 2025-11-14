/**
 * FiltersPanel Component
 * Panel with all filter controls
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Filter, X } from 'lucide-react';
import { PERIOD_OPTIONS, REGIONS } from '../../constants/config';

const FiltersPanel = React.memo(({
  selectedPeriod,
  locationFilter,
  stateFilter,
  regionFilter,
  prizeTierFilter,
  onPeriodChange,
  onLocationChange,
  onStateChange,
  onRegionChange,
  onPrizeTierChange,
  onReset,
  hasActiveFilters,
}) => {
  const brazilianStates = Object.keys(REGIONS).sort();
  const regions = [...new Set(Object.values(REGIONS))].sort();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-green-600" />
          Filtros
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            <X className="w-4 h-4" />
            Limpar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Period Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {PERIOD_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cidade
          </label>
          <input
            type="text"
            value={locationFilter}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="Ex: São Paulo"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* State Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado (UF)
          </label>
          <select
            value={stateFilter}
            onChange={(e) => onStateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todos os estados</option>
            {brazilianStates.map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* Region Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Região
          </label>
          <select
            value={regionFilter}
            onChange={(e) => onRegionChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todas as regiões</option>
            {regions.map(region => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {/* Prize Tier Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Faixa de Prêmio
          </label>
          <select
            value={prizeTierFilter}
            onChange={(e) => onPrizeTierChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todas as faixas</option>
            <option value="sena">Sena (6 acertos)</option>
            <option value="quina">Quina (5 acertos)</option>
            <option value="quadra">Quadra (4 acertos)</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Filtros ativos:</strong>
            {selectedPeriod !== 'last100' && (
              <span className="ml-2 inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                {PERIOD_OPTIONS.find(p => p.value === selectedPeriod)?.label}
              </span>
            )}
            {locationFilter && (
              <span className="ml-2 inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                Cidade: {locationFilter}
              </span>
            )}
            {stateFilter && (
              <span className="ml-2 inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                Estado: {stateFilter}
              </span>
            )}
            {regionFilter && (
              <span className="ml-2 inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                Região: {regionFilter}
              </span>
            )}
            {prizeTierFilter && (
              <span className="ml-2 inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                {prizeTierFilter === 'sena' ? 'Sena' : prizeTierFilter === 'quina' ? 'Quina' : 'Quadra'}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
});

FiltersPanel.propTypes = {
  selectedPeriod: PropTypes.string.isRequired,
  locationFilter: PropTypes.string,
  stateFilter: PropTypes.string,
  regionFilter: PropTypes.string,
  prizeTierFilter: PropTypes.string,
  onPeriodChange: PropTypes.func.isRequired,
  onLocationChange: PropTypes.func.isRequired,
  onStateChange: PropTypes.func.isRequired,
  onRegionChange: PropTypes.func.isRequired,
  onPrizeTierChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  hasActiveFilters: PropTypes.bool,
};

FiltersPanel.displayName = 'FiltersPanel';

export default FiltersPanel;
