// Cache Service - Gerencia cache local dos dados da Mega-Sena
const CACHE_KEY = 'megasena_data';
const CACHE_TIMESTAMP_KEY = 'megasena_timestamp';
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 horas em ms

export const cacheService = {
  /**
   * Salva dados no localStorage
   */
  saveDraws: (draws) => {
    try {
      const data = {
        draws,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      console.log(`✅ Cache salvo: ${draws.length} concursos`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar cache:', error);
      return false;
    }
  },

  /**
   * Carrega dados do localStorage
   */
  loadDraws: () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) {
        console.log('ℹ️ Cache vazio');
        return null;
      }

      const data = JSON.parse(cached);
      const age = Date.now() - data.timestamp;
      const ageHours = Math.floor(age / (1000 * 60 * 60));

      console.log(`📦 Cache encontrado: ${data.draws.length} concursos (${ageHours}h atrás)`);
      
      return {
        draws: data.draws,
        age: age,
        isExpired: age > CACHE_EXPIRATION
      };
    } catch (error) {
      console.error('❌ Erro ao carregar cache:', error);
      return null;
    }
  },

  /**
   * Verifica se o cache existe e é válido
   */
  isValid: () => {
    const cache = cacheService.loadDraws();
    return cache && !cache.isExpired;
  },

  /**
   * Limpa o cache
   */
  clear: () => {
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      console.log('🗑️ Cache limpo');
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar cache:', error);
      return false;
    }
  },

  /**
   * Verifica se precisa atualizar
   */
  needsUpdate: (currentDraws) => {
    const cache = cacheService.loadDraws();
    if (!cache) return true;
    
    // Se passou mais de 24h, precisa atualizar
    if (cache.isExpired) return true;
    
    // Se o número de concursos é diferente, precisa atualizar
    if (currentDraws && currentDraws.length !== cache.draws.length) return true;
    
    return false;
  },

  /**
   * Obtém informações sobre o cache
   */
  getCacheInfo: () => {
    const cache = cacheService.loadDraws();
    if (!cache) {
      return {
        exists: false,
        message: 'Nenhum dado em cache'
      };
    }

    const ageHours = Math.floor(cache.age / (1000 * 60 * 60));
    const ageMinutes = Math.floor((cache.age % (1000 * 60 * 60)) / (1000 * 60));

    return {
      exists: true,
      count: cache.draws.length,
      age: `${ageHours}h ${ageMinutes}m`,
      isExpired: cache.isExpired,
      message: cache.isExpired 
        ? '⚠️ Cache expirado - recomendado atualizar'
        : `✅ Cache válido com ${cache.draws.length} concursos`
    };
  }
};

export default cacheService;
