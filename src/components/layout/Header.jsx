/**
 * Header Component
 * Main header with title, stats, and actions
 */

import React from 'react';
import PropTypes from 'prop-types';
import { RefreshCw, Download, Calendar, Award } from 'lucide-react';
import StatCard from '../common/StatCard';

const Header = React.memo(({
  title,
  summary,
  loading,
  syncing,
  onRefresh,
  onExport,
  onViewChange,
  currentView,
}) => {
  return (
    <div className="bg-gradient-to-r from-green-600 to-green-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title and Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              🎰 {title}
            </h1>
            <p className="text-green-100 mt-1">
              Análise Estatística Completa com Dados Oficiais da Caixa
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onRefresh}
              disabled={loading || syncing}
              className="flex items-center gap-2 bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading || syncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{syncing ? 'Sincronizando...' : 'Atualizar'}</span>
            </button>
            {onExport && (
              <button
                onClick={onExport}
                disabled={loading}
                className="flex items-center gap-2 bg-green-800 text-white px-4 py-2 rounded-lg hover:bg-green-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Excel</span>
              </button>
            )}
          </div>
        </div>

        {/* View Toggle */}
        {onViewChange && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => onViewChange('analysis')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'analysis'
                  ? 'bg-white text-green-700'
                  : 'bg-green-700 text-white hover:bg-green-600'
              }`}
            >
              <Award className="w-4 h-4" />
              Análises
            </button>
            <button
              onClick={() => onViewChange('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'calendar'
                  ? 'bg-white text-green-700'
                  : 'bg-green-700 text-white hover:bg-green-600'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Calendário
            </button>
          </div>
        )}

        {/* Stats Summary */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard
              icon={Award}
              title="Total de Sorteios"
              value={summary.totalDraws}
              color="green"
            />
            <StatCard
              icon={Award}
              title="Números Sorteados"
              value={summary.totalNumbers}
              color="blue"
            />
            <StatCard
              icon={Award}
              title="Freq. Média"
              value={Math.round(summary.avgFrequency)}
              subtitle="por número"
              color="yellow"
            />
            <StatCard
              icon={Award}
              title="Freq. Máxima"
              value={summary.maxFrequency}
              color="red"
            />
            {summary.megaViradaCount > 0 && (
              <StatCard
                icon={Award}
                title="Mega da Virada"
                value={summary.megaViradaCount}
                color="purple"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
});

Header.propTypes = {
  title: PropTypes.string.isRequired,
  summary: PropTypes.shape({
    totalDraws: PropTypes.number,
    totalNumbers: PropTypes.number,
    avgFrequency: PropTypes.number,
    maxFrequency: PropTypes.number,
    minFrequency: PropTypes.number,
    megaViradaCount: PropTypes.number,
  }),
  loading: PropTypes.bool,
  syncing: PropTypes.bool,
  onRefresh: PropTypes.func.isRequired,
  onExport: PropTypes.func,
  onViewChange: PropTypes.func,
  currentView: PropTypes.string,
};

Header.displayName = 'Header';

export default Header;
