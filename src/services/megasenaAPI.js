/**
 * Mega-Sena API Service
 * Handles all API calls to Caixa Econômica Federal lottery data
 */

import { API_CONFIG } from '../constants/config';

/**
 * Fetches a single draw by contest number
 * @param {number} contestNumber - The contest number to fetch
 * @returns {Promise<Object|null>} Draw data or null if error
 */
export async function fetchDrawByNumber(contestNumber) {
  try {
    const url = `${API_CONFIG.BASE_URL}/${contestNumber}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`Failed to fetch contest ${contestNumber}: ${response.status}`);
      return null;
    }

    const data = await response.json();

    return transformDrawData(data);
  } catch (error) {
    console.error(`Error fetching contest ${contestNumber}:`, error);
    return null;
  }
}

/**
 * Fetches the latest draw
 * @returns {Promise<Object>} Latest draw data
 */
export async function fetchLatestDraw() {
  try {
    const response = await fetch(API_CONFIG.BASE_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      numero: data.numero,
      data: transformDrawData(data),
    };
  } catch (error) {
    console.error('Error fetching latest draw:', error);
    throw error;
  }
}

/**
 * Fetches multiple draws in batches
 * @param {number} startContest - Start contest number
 * @param {number} endContest - End contest number
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array>} Array of draws
 */
export async function fetchDrawsBatch(startContest, endContest, onProgress) {
  const allDraws = [];
  const total = endContest - startContest + 1;

  for (let i = startContest; i <= endContest; i += API_CONFIG.BATCH_SIZE) {
    const batchEnd = Math.min(i + API_CONFIG.BATCH_SIZE - 1, endContest);
    const batch = [];

    for (let j = i; j <= batchEnd; j++) {
      batch.push(fetchDrawByNumber(j));
    }

    const results = await Promise.all(batch);
    const validResults = results.filter(r => r !== null);
    allDraws.push(...validResults);

    // Update progress
    const current = Math.min(batchEnd - startContest + 1, total);
    if (onProgress) {
      onProgress({ current, total });
    }

    // Add delay between batches to avoid rate limiting
    if (batchEnd < endContest) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
    }
  }

  return allDraws;
}

/**
 * Transforms raw API data to application format
 * @param {Object} data - Raw API data
 * @returns {Object} Transformed draw data
 */
function transformDrawData(data) {
  // Use official draw date from API (dataApuracao is DD/MM/YYYY)
  const drawDate = data.dataApuracao || data.data || '';

  // Check if it's Mega da Virada
  const isMegaDaVirada = data.indicadorConcursoEspecial === 2 ||
                         drawDate.includes('31/12') ||
                         false;

  // Extract winner cities from prize tiers
  const municipiosGanhadores = [];
  if (data.listaRateioPremio) {
    data.listaRateioPremio.forEach(prize => {
      if (prize.numeroDeGanhadores > 0 && prize.nomeMunicipioUF) {
        municipiosGanhadores.push({
          faixa: prize.faixa,
          descricao: prize.descricaoFaixa,
          cidade: prize.nomeMunicipioUF,
          ganhadores: prize.numeroDeGanhadores,
          valorPremio: prize.valorPremio,
        });
      }
    });
  }

  return {
    concurso: data.numero,
    data: drawDate,
    dezenas: data.listaDezenas?.map(Number) || [],
    premiacaoTotal: data.valorEstimadoProximoConcurso || 0,
    valorArrecadado: data.valorArrecadado || 0,
    ganhadores6: data.listaRateioPremio?.[0]?.numeroDeGanhadores || 0,
    ganhadores5: data.listaRateioPremio?.[1]?.numeroDeGanhadores || 0,
    ganhadores4: data.listaRateioPremio?.[2]?.numeroDeGanhadores || 0,
    valorPremio6: data.listaRateioPremio?.[0]?.valorPremio || 0,
    valorPremio5: data.listaRateioPremio?.[1]?.valorPremio || 0,
    valorPremio4: data.listaRateioPremio?.[2]?.valorPremio || 0,
    acumulado: data.acumulado || false,
    valorAcumulado: data.valorAcumuladoProximoConcurso || 0,
    proximoConcurso: data.numeroConcursoProximo,
    dataProximoConcurso: data.dataProximoConcurso,
    localSorteio: data.local || data.nomeMunicipioUFSorteio || '',
    cidadeSorteio: data.nomeMunicipioUFSorteio || '',
    municipiosGanhadores,
    isMegaDaVirada,
    observacao: data.observacao || '',
  };
}

/**
 * Generates sample draws for testing
 * @param {number} count - Number of sample draws to generate
 * @returns {Array} Array of sample draws
 */
export function generateSampleDraws(count = 100) {
  const sampleDraws = [];

  for (let i = 0; i < count; i++) {
    const concurso = 2800 - i;
    const date = new Date();
    date.setDate(date.getDate() - i * 3);

    // Generate 6 unique random numbers
    const dezenas = [];
    while (dezenas.length < 6) {
      const num = Math.floor(Math.random() * 60) + 1;
      if (!dezenas.includes(num)) {
        dezenas.push(num);
      }
    }
    dezenas.sort((a, b) => a - b);

    sampleDraws.push({
      concurso,
      data: date.toLocaleDateString('pt-BR'),
      dezenas,
      premiacaoTotal: Math.floor(Math.random() * 100000000),
      valorArrecadado: Math.floor(Math.random() * 200000000),
      ganhadores6: Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0,
      ganhadores5: Math.floor(Math.random() * 100),
      ganhadores4: Math.floor(Math.random() * 5000),
      acumulado: Math.random() > 0.8,
      valorAcumulado: Math.floor(Math.random() * 50000000),
      proximoConcurso: concurso + 1,
      dataProximoConcurso: new Date(date.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
      localSorteio: 'Caminhão da Sorte',
      cidadeSorteio: ['São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG', 'Salvador, BA'][Math.floor(Math.random() * 4)],
      municipiosGanhadores: [],
      isMegaDaVirada: date.getMonth() === 11 && date.getDate() === 31,
    });
  }

  return sampleDraws;
}
