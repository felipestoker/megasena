/**
 * AnalysisPage Component
 * Main analysis page with tabs for different analyses
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useStatistics } from '../hooks/useStatistics';
import {
  FrequencyAnalysis,
  DelayAnalysis,
  PatternAnalysis,
  FrequentPairs,
  GeographicAnalysis,
  DrawsTable,
  FiltersPanel,
  LoadingSpinner,
} from '../components';

const AnalysisPage = React.memo(({
  draws,
  filteredDraws,
  filters,
  loading,
  loadingProgress,
}) => {
  const [activeTab, setActiveTab] = useState('frequency');

  // Get statistics from hook
  const statistics = useStatistics(filteredDraws, draws);

  if (loading) {
    return <LoadingSpinner message="Carregando dados..." progress={loadingProgress} />;
  }

  if (!filteredDraws || filteredDraws.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">
            Nenhum sorteio encontrado com os filtros aplicados.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'frequency', label: '📊 Frequência' },
    { id: 'delay', label: '⏱️ Atrasos' },
    { id: 'patterns', label: '🎯 Padrões' },
    { id: 'pairs', label: '👥 Pares' },
    { id: 'geography', label: '🗺️ Geografia' },
    { id: 'results', label: '📋 Resultados' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Filters */}
        <FiltersPanel
          selectedPeriod={filters.selectedPeriod}
          locationFilter={filters.locationFilter}
          stateFilter={filters.stateFilter}
          regionFilter={filters.regionFilter}
          prizeTierFilter={filters.prizeTierFilter}
          onPeriodChange={filters.setSelectedPeriod}
          onLocationChange={filters.setLocationFilter}
          onStateChange={filters.setStateFilter}
          onRegionChange={filters.setRegionFilter}
          onPrizeTierChange={filters.setPrizeTierFilter}
          onReset={filters.resetFilters}
          hasActiveFilters={filters.hasActiveFilters}
        />

        {/* Results Count */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            📊 Analisando <strong>{filteredDraws.length}</strong> sorteios
            {filters.hasActiveFilters && (
              <span className="ml-2 text-blue-700">
                (filtrado de {draws.length} total)
              </span>
            )}
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-1 p-2" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap px-4 py-3 rounded-lg font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'frequency' && (
              <FrequencyAnalysis
                numberFrequency={statistics.numberFrequency}
                topFrequent={statistics.topFrequent}
                topRare={statistics.topRare}
              />
            )}

            {activeTab === 'delay' && (
              <DelayAnalysis
                delayAnalysis={statistics.delayAnalysis}
                topDelayed={statistics.topDelayed}
              />
            )}

            {activeTab === 'patterns' && (
              <PatternAnalysis patternAnalysis={statistics.patternAnalysis} />
            )}

            {activeTab === 'pairs' && (
              <FrequentPairs frequentPairs={statistics.frequentPairs} />
            )}

            {activeTab === 'geography' && (
              <GeographicAnalysis geographicAnalysis={statistics.geographicAnalysis} />
            )}

            {activeTab === 'results' && (
              <DrawsTable draws={filteredDraws} maxResults={100} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

AnalysisPage.propTypes = {
  draws: PropTypes.array.isRequired,
  filteredDraws: PropTypes.array.isRequired,
  filters: PropTypes.shape({
    selectedPeriod: PropTypes.string.isRequired,
    locationFilter: PropTypes.string,
    stateFilter: PropTypes.string,
    regionFilter: PropTypes.string,
    prizeTierFilter: PropTypes.string,
    setSelectedPeriod: PropTypes.func.isRequired,
    setLocationFilter: PropTypes.func.isRequired,
    setStateFilter: PropTypes.func.isRequired,
    setRegionFilter: PropTypes.func.isRequired,
    setPrizeTierFilter: PropTypes.func.isRequired,
    resetFilters: PropTypes.func.isRequired,
    hasActiveFilters: PropTypes.bool,
  }).isRequired,
  loading: PropTypes.bool,
  loadingProgress: PropTypes.shape({
    current: PropTypes.number,
    total: PropTypes.number,
  }),
};

AnalysisPage.displayName = 'AnalysisPage';

export default AnalysisPage;
