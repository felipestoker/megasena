import { useState, useEffect, useCallback } from 'react';
import cacheService from './cacheService';

/**
 * Hook customizado para gerenciar dados da Mega-Sena com cache
 */
export const useMegaSenaData = () => {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);
  const [isUsingCache, setIsUsingCache] = useState(false);

  /**
   * Carrega dados do cache primeiro
   */
  const loadFromCache = useCallback(() => {
    console.log('🔍 Verificando cache...');
    const cached = cacheService.loadDraws();
    
    if (cached && cached.draws.length > 0) {
      console.log(`✅ Dados carregados do cache: ${cached.draws.length} concursos`);
      setDraws(cached.draws);
      setIsUsingCache(true);
      setCacheInfo(cacheService.getCacheInfo());
      return true;
    }
    
    console.log('ℹ️ Nenhum dado em cache');
    return false;
  }, []);

  /**
   * Busca dados da API
   */
  const fetchFromAPI = useCallback(async (mode = 'quick') => {
    setLoading(true);
    setError(null);
    setIsUsingCache(false);
    setLoadingProgress({ current: 0, total: 0 });
    
    try {
      console.log('🌐 Buscando dados da API...');
      
      // Buscar o último concurso
      const latestResponse = await fetch(
        'https://api.allorigins.win/get?url=' + 
        encodeURIComponent('https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena')
      );
      
      if (!latestResponse.ok) {
        throw new Error(`HTTP error! status: ${latestResponse.status}`);
      }
      
      const latestResponseData = await latestResponse.json();
      const latestData = JSON.parse(latestResponseData.contents);
      const latestNumber = latestData.numero;
      
      console.log(`📊 Último concurso: ${latestNumber}`);
      
      // Determinar quantos concursos buscar
      let startConcurso, concursosParaBuscar;
      
      if (mode === 'quick') {
        startConcurso = Math.max(1, latestNumber - 99); // Últimos 100
        concursosParaBuscar = 100;
        console.log(`⚡ Modo rápido: ${concursosParaBuscar} concursos`);
      } else {
        startConcurso = 1;
        concursosParaBuscar = latestNumber;
        console.log(`🔄 Modo completo: TODOS os ${latestNumber} concursos`);
      }
      
      setLoadingProgress({ current: 0, total: concursosParaBuscar });
      
      const allDraws = [];
      const batchSize = 10; // Buscar 10 por vez
      
      // Buscar em lotes
      for (let i = startConcurso; i <= latestNumber; i += batchSize) {
        const batch = [];
        const endBatch = Math.min(i + batchSize - 1, latestNumber);
        
        for (let j = i; j <= endBatch; j++) {
          batch.push(
            fetch(
              'https://api.allorigins.win/get?url=' + 
              encodeURIComponent(`https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/${j}`)
            )
              .then(res => res.ok ? res.json() : Promise.reject(res))
              .then(data => JSON.parse(data.contents))
              .catch(err => {
                console.error(`❌ Erro concurso ${j}:`, err);
                return null;
              })
          );
        }
        
        const results = await Promise.all(batch);
        
        results.forEach(data => {
          if (data && data.listaDezenas) {
            allDraws.push({
              concurso: data.numero,
              data: data.dataApuracao,
              dezenas: data.listaDezenas.map(Number).sort((a, b) => a - b),
              premiacaoTotal: parseFloat(data.valorEstimadoProximoConcurso || 0),
              valorArrecadado: parseFloat(data.valorArrecadado || 0),
              ganhadores6: data.listaRateioPremio?.find(r => r.descricaoFaixa === "6 acertos")?.numeroDeGanhadores || 0,
              ganhadores5: data.listaRateioPremio?.find(r => r.descricaoFaixa === "5 acertos")?.numeroDeGanhadores || 0,
              ganhadores4: data.listaRateioPremio?.find(r => r.descricaoFaixa === "4 acertos")?.numeroDeGanhadores || 0,
              premioSena: parseFloat(data.listaRateioPremio?.find(r => r.descricaoFaixa === "6 acertos")?.valorPremio || 0),
              acumulado: (data.listaRateioPremio?.find(r => r.descricaoFaixa === "6 acertos")?.numeroDeGanhadores || 0) === 0,
              valorAcumulado: parseFloat(data.valorAcumuladoConcurso_0_5 || 0),
              proximoConcurso: data.numeroConcursoProximo,
              dataProximoConcurso: data.dataProximoConcurso,
              localSorteio: data.localSorteio || 'Não informado',
              cidadeSorteio: data.nomeMunicipioUFSorteio || 'Não informado',
              municipiosGanhadores: data.listaRateioPremio
                ?.find(r => r.descricaoFaixa === "6 acertos")
                ?.listaMunicipioUFGanhadores || [],
              isMegaDaVirada: data.tipoJogo === 2
            });
          }
        });
        
        setLoadingProgress({ 
          current: Math.min(allDraws.length, concursosParaBuscar), 
          total: concursosParaBuscar 
        });
        
        console.log(`📥 Progresso: ${allDraws.length}/${concursosParaBuscar}`);
      }
      
      // Ordenar por concurso (mais recente primeiro)
      allDraws.sort((a, b) => b.concurso - a.concurso);
      
      console.log(`✅ Total carregado: ${allDraws.length} concursos`);
      
      // Salvar no cache
      cacheService.saveDraws(allDraws);
      
      setDraws(allDraws);
      setCacheInfo(cacheService.getCacheInfo());
      
      return allDraws;
      
    } catch (err) {
      console.error('❌ Erro ao buscar dados:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Inicialização: tenta carregar do cache primeiro
   */
  useEffect(() => {
    const hasCache = loadFromCache();
    
    if (!hasCache) {
      console.log('ℹ️ Primeira vez - carregando dados rápidos...');
      fetchFromAPI('quick').catch(console.error);
    }
  }, [loadFromCache, fetchFromAPI]);

  /**
   * Força atualização dos dados
   */
  const refresh = useCallback((mode = 'quick') => {
    console.log(`🔄 Atualizando dados (${mode})...`);
    return fetchFromAPI(mode);
  }, [fetchFromAPI]);

  /**
   * Limpa cache e recarrega
   */
  const clearAndRefresh = useCallback((mode = 'quick') => {
    console.log('🗑️ Limpando cache e recarregando...');
    cacheService.clear();
    return fetchFromAPI(mode);
  }, [fetchFromAPI]);

  return {
    draws,
    loading,
    loadingProgress,
    error,
    cacheInfo,
    isUsingCache,
    refresh,
    clearAndRefresh,
    loadFromCache
  };
};

export default useMegaSenaData;
