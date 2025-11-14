/**
 * DrawsTable Component
 * Displays a table of recent lottery results
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Calendar, Award, Users, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import NumberBall from '../common/NumberBall';
import { formatCurrency, formatNumber } from '../../utils/formatters';

const DrawsTable = React.memo(({ draws, maxResults = 50 }) => {
  const [expanded, setExpanded] = useState({});
  const [showCount, setShowCount] = useState(10);

  if (!draws || draws.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Nenhum resultado disponível
      </div>
    );
  }

  const displayedDraws = draws.slice(0, showCount);

  const toggleExpand = (concurso) => {
    setExpanded(prev => ({
      ...prev,
      [concurso]: !prev[concurso]
    }));
  };

  const loadMore = () => {
    setShowCount(prev => Math.min(prev + 10, maxResults));
  };

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Últimos Resultados
        </h3>
        <p className="text-sm text-gray-600">
          Mostrando {displayedDraws.length} de {Math.min(draws.length, maxResults)} resultados
        </p>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {displayedDraws.map((draw) => {
          const isExpanded = expanded[draw.concurso];
          const isMegaVirada = draw.isMegaDaVirada;

          return (
            <div
              key={draw.concurso}
              className={`bg-white rounded-xl shadow-sm border transition-all ${
                isMegaVirada
                  ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-yellow-100'
                  : 'border-gray-200'
              }`}
            >
              {/* Main Info */}
              <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Concurso Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold text-sm">
                        #{draw.concurso}
                      </span>
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {draw.data}
                      </span>
                      {isMegaVirada && (
                        <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-bold text-xs">
                          🎊 MEGA DA VIRADA
                        </span>
                      )}
                    </div>

                    {/* Numbers */}
                    <div className="flex flex-wrap gap-2">
                      {draw.dezenas.map((num) => (
                        <NumberBall
                          key={num}
                          number={num}
                          size="sm"
                          variant={isMegaVirada ? 'megaVirada' : 'default'}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-4">
                    {draw.ganhadores6 > 0 ? (
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Ganhadores</p>
                        <p className="text-lg font-bold text-green-600">{draw.ganhadores6}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-xs text-gray-600">Status</p>
                        <p className="text-sm font-bold text-red-600">ACUMULOU</p>
                      </div>
                    )}

                    <button
                      onClick={() => toggleExpand(draw.concurso)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Sena */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-gray-900">Sena (6 acertos)</h4>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Ganhadores:</span>
                          <span className="font-semibold">{draw.ganhadores6 || 0}</span>
                        </div>
                        {draw.valorPremio6 > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Prêmio:</span>
                            <span className="font-semibold text-green-600">
                              {formatCurrency(draw.valorPremio6)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quina */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <h4 className="font-semibold text-gray-900">Quina (5 acertos)</h4>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Ganhadores:</span>
                          <span className="font-semibold">{formatNumber(draw.ganhadores5)}</span>
                        </div>
                        {draw.valorPremio5 > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Prêmio:</span>
                            <span className="font-semibold text-blue-600">
                              {formatCurrency(draw.valorPremio5)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quadra */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-purple-600" />
                        <h4 className="font-semibold text-gray-900">Quadra (4 acertos)</h4>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Ganhadores:</span>
                          <span className="font-semibold">{formatNumber(draw.ganhadores4)}</span>
                        </div>
                        {draw.valorPremio4 > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Prêmio:</span>
                            <span className="font-semibold text-purple-600">
                              {formatCurrency(draw.valorPremio4)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Arrecadação</p>
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(draw.valorArrecadado)}
                        </p>
                      </div>
                      {draw.cidadeSorteio && (
                        <div>
                          <p className="text-gray-600">Local do Sorteio</p>
                          <p className="font-semibold text-gray-900">{draw.cidadeSorteio}</p>
                        </div>
                      )}
                      {draw.acumulado && (
                        <div>
                          <p className="text-gray-600">Acumulado</p>
                          <p className="font-semibold text-red-600">
                            {formatCurrency(draw.valorAcumulado)}
                          </p>
                        </div>
                      )}
                      {draw.proximoConcurso && (
                        <div>
                          <p className="text-gray-600">Próximo Concurso</p>
                          <p className="font-semibold text-gray-900">
                            #{draw.proximoConcurso}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {showCount < Math.min(draws.length, maxResults) && (
        <div className="text-center">
          <button
            onClick={loadMore}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Carregar Mais ({Math.min(draws.length - showCount, 10)} resultados)
          </button>
        </div>
      )}

      {showCount >= Math.min(draws.length, maxResults) && draws.length > maxResults && (
        <div className="text-center text-sm text-gray-500">
          Mostrando os primeiros {maxResults} resultados
        </div>
      )}
    </div>
  );
});

DrawsTable.propTypes = {
  draws: PropTypes.arrayOf(PropTypes.shape({
    concurso: PropTypes.number.isRequired,
    data: PropTypes.string.isRequired,
    dezenas: PropTypes.arrayOf(PropTypes.number).isRequired,
    ganhadores6: PropTypes.number,
    ganhadores5: PropTypes.number,
    ganhadores4: PropTypes.number,
    valorPremio6: PropTypes.number,
    valorPremio5: PropTypes.number,
    valorPremio4: PropTypes.number,
    valorArrecadado: PropTypes.number,
    acumulado: PropTypes.bool,
    valorAcumulado: PropTypes.number,
    proximoConcurso: PropTypes.number,
    cidadeSorteio: PropTypes.string,
    isMegaDaVirada: PropTypes.bool,
  })).isRequired,
  maxResults: PropTypes.number,
};

DrawsTable.displayName = 'DrawsTable';

export default DrawsTable;
