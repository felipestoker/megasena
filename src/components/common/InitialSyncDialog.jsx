/**
 * InitialSyncDialog Component
 * Displays a dialog for initial database sync
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Download, Database, AlertCircle } from 'lucide-react';

const InitialSyncDialog = React.memo(({ onStartSync, syncProgress, syncing }) => {
  const [showDetails, setShowDetails] = useState(false);

  const { current, total, message } = syncProgress;
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <Database className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo ao Mega-Sena Analytics!
          </h2>
          <p className="text-gray-600">
            Para começar, vamos baixar todo o histórico da Mega-Sena
          </p>
        </div>

        {/* Info Cards */}
        {!syncing && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <Download className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">Download Único</p>
              <p className="text-xs text-gray-600 mt-1">Só precisa fazer uma vez</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <Database className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">Dados Locais</p>
              <p className="text-xs text-gray-600 mt-1">Armazenados no seu navegador</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">Carregamento Rápido</p>
              <p className="text-xs text-gray-600 mt-1">Abertura instantânea depois</p>
            </div>
          </div>
        )}

        {/* Progress */}
        {syncing && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-medium text-gray-700">{message}</p>
              <p className="text-sm font-bold text-green-600">{percentage}%</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                style={{ width: `${percentage}%` }}
              >
                {percentage > 10 && (
                  <span className="text-xs font-bold text-white">{percentage}%</span>
                )}
              </div>
            </div>

            {/* Stats */}
            {total > 0 && (
              <div className="flex justify-between text-xs text-gray-600">
                <span>Concursos baixados: {current}</span>
                <span>Total: {total}</span>
              </div>
            )}

            {/* Spinner */}
            <div className="flex items-center justify-center mt-6">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600"></div>
              <span className="ml-3 text-sm text-gray-600">Baixando dados...</span>
            </div>
          </div>
        )}

        {/* Details Toggle */}
        {!syncing && (
          <div className="mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              {showDetails ? 'Esconder' : 'Mostrar'} detalhes técnicos
            </button>

            {showDetails && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                <p className="mb-2">
                  <strong>O que será baixado:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Todos os sorteios desde 1996 (~2.700 concursos)</li>
                  <li>Números sorteados de cada concurso</li>
                  <li>Informações de premiação e ganhadores</li>
                  <li>Localização dos sorteios</li>
                </ul>
                <p className="mt-4 mb-2">
                  <strong>Armazenamento:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Os dados ficam salvos no IndexedDB do navegador</li>
                  <li>Tamanho aproximado: ~5-10 MB</li>
                  <li>Não afeta outros sites</li>
                  <li>Pode limpar a qualquer momento nas configurações</li>
                </ul>
                <p className="mt-4 mb-2">
                  <strong>Próximas aberturas:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Carregamento instantâneo (dados locais)</li>
                  <li>Sincronização automática em segundo plano</li>
                  <li>Apenas novos sorteios são baixados</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {!syncing && (
          <button
            onClick={onStartSync}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl"
          >
            <Download className="w-6 h-6 inline-block mr-2" />
            Baixar Histórico Completo
          </button>
        )}

        {/* Info */}
        {syncing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-blue-900 text-center">
              ⏱️ Este processo leva cerca de 2-5 minutos dependendo da sua conexão.
              <br />
              Por favor, não feche esta aba.
            </p>
          </div>
        )}

        {!syncing && (
          <p className="text-xs text-gray-500 text-center mt-4">
            💡 Dica: Após o download inicial, o app abrirá instantaneamente nas próximas vezes!
          </p>
        )}
      </div>
    </div>
  );
});

InitialSyncDialog.propTypes = {
  onStartSync: PropTypes.func.isRequired,
  syncProgress: PropTypes.shape({
    current: PropTypes.number,
    total: PropTypes.number,
    message: PropTypes.string,
  }).isRequired,
  syncing: PropTypes.bool.isRequired,
};

InitialSyncDialog.displayName = 'InitialSyncDialog';

export default InitialSyncDialog;
