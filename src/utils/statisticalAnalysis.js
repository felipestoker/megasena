/**
 * Statistical Analysis Utilities
 * Pure functions for analyzing lottery draws
 */

/**
 * Calculates number frequency across draws
 * @param {Array} draws - Array of draw objects
 * @returns {Array} Array of frequency data for each number
 */
export function calculateNumberFrequency(draws) {
  const freq = {};
  const totalDraws = draws.length;

  // Initialize frequency object for all numbers
  for (let i = 1; i <= 60; i++) {
    freq[i] = { number: i, count: 0, percentage: 0, lastSeen: null };
  }

  // Count occurrences and track last seen
  draws.forEach((draw, index) => {
    draw.dezenas.forEach(num => {
      freq[num].count++;
      if (!freq[num].lastSeen || index < freq[num].lastSeen) {
        freq[num].lastSeen = index;
      }
    });
  });

  // Calculate percentages and classification
  const expectedFreq = (totalDraws * 6) / 60;
  const stdDev = Math.sqrt(expectedFreq);

  Object.values(freq).forEach(item => {
    item.percentage = totalDraws > 0 ? ((item.count / totalDraws) * 100).toFixed(2) : 0;
    item.delay = item.lastSeen !== null ? item.lastSeen : totalDraws;

    // Z-Score for classification
    const zScore = stdDev > 0 ? (item.count - expectedFreq) / stdDev : 0;
    if (zScore >= 1.5) {
      item.classification = 'quente';
      item.color = '#ef4444';
    } else if (zScore <= -1.5) {
      item.classification = 'frio';
      item.color = '#3b82f6';
    } else {
      item.classification = 'neutro';
      item.color = '#6b7280';
    }
  });

  return Object.values(freq).sort((a, b) => b.count - a.count);
}

/**
 * Analyzes delay patterns for numbers
 * @param {Array} numberFrequency - Frequency data from calculateNumberFrequency
 * @returns {Array} Array of delay data
 */
export function analyzeDelays(numberFrequency) {
  return numberFrequency
    .map(item => ({
      number: item.number,
      delay: item.delay,
      classification: item.delay > 15 ? 'atrasado' : item.delay > 8 ? 'médio' : 'recente',
      color: item.delay > 15 ? '#dc2626' : item.delay > 8 ? '#f59e0b' : '#10b981'
    }))
    .sort((a, b) => b.delay - a.delay);
}

/**
 * Finds most frequent number pairs
 * @param {Array} draws - Array of draw objects
 * @param {number} topN - Number of top pairs to return
 * @returns {Array} Array of frequent pairs
 */
export function findFrequentPairs(draws, topN = 20) {
  const pairs = {};

  draws.forEach(draw => {
    for (let i = 0; i < draw.dezenas.length - 1; i++) {
      for (let j = i + 1; j < draw.dezenas.length; j++) {
        const pair = `${draw.dezenas[i]}-${draw.dezenas[j]}`;
        pairs[pair] = (pairs[pair] || 0) + 1;
      }
    }
  });

  return Object.entries(pairs)
    .map(([pair, count]) => ({
      pair,
      count,
      percentage: ((count / draws.length) * 100).toFixed(2)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

/**
 * Analyzes draw patterns (even/odd, high/low, etc.)
 * @param {Array} draws - Array of draw objects
 * @returns {Object} Pattern analysis data
 */
export function analyzePatterns(draws) {
  if (!draws.length) return null;

  const patterns = {
    parImpar: { par: 0, impar: 0 },
    baixoAlto: { baixo: 0, alto: 0 },
    distribuicao: {},
    sequencias: 0,
    multiplos5: 0,
    somaMedia: 0,
    distribuicaoDecadas: {
      '01-10': 0,
      '11-20': 0,
      '21-30': 0,
      '31-40': 0,
      '41-50': 0,
      '51-60': 0
    }
  };

  draws.forEach(draw => {
    let parCount = 0;
    let baixoCount = 0;
    let soma = 0;
    let hasSequence = false;
    let hasMultiple5 = false;

    draw.dezenas.forEach((num, idx) => {
      if (num % 2 === 0) parCount++;
      if (num <= 30) baixoCount++;
      soma += num;
      if (num % 5 === 0) hasMultiple5 = true;

      if (idx > 0 && draw.dezenas[idx] === draw.dezenas[idx - 1] + 1) {
        hasSequence = true;
      }

      // Distribution by decades
      if (num <= 10) patterns.distribuicaoDecadas['01-10']++;
      else if (num <= 20) patterns.distribuicaoDecadas['11-20']++;
      else if (num <= 30) patterns.distribuicaoDecadas['21-30']++;
      else if (num <= 40) patterns.distribuicaoDecadas['31-40']++;
      else if (num <= 50) patterns.distribuicaoDecadas['41-50']++;
      else patterns.distribuicaoDecadas['51-60']++;
    });

    const parImparKey = `${parCount}P/${6 - parCount}I`;
    patterns.distribuicao[parImparKey] = (patterns.distribuicao[parImparKey] || 0) + 1;

    patterns.parImpar.par += parCount;
    patterns.parImpar.impar += (6 - parCount);
    patterns.baixoAlto.baixo += baixoCount;
    patterns.baixoAlto.alto += (6 - baixoCount);

    if (hasSequence) patterns.sequencias++;
    if (hasMultiple5) patterns.multiplos5++;
    patterns.somaMedia += soma;
  });

  patterns.somaMedia = Math.round(patterns.somaMedia / draws.length);
  patterns.sequenciasPerc = ((patterns.sequencias / draws.length) * 100).toFixed(2);
  patterns.multiplos5Perc = ((patterns.multiplos5 / draws.length) * 100).toFixed(2);

  return patterns;
}

/**
 * Analyzes geographic distribution of draws
 * @param {Array} draws - Array of draw objects
 * @returns {Object} Geographic analysis data
 */
export function analyzeGeography(draws) {
  if (!draws.length) return { cities: {}, states: {}, totalDrawsWithLocation: 0 };

  const cityGroups = {};
  const states = {};
  let totalDrawsWithLocation = 0;

  const normalizeCityLabel = (raw) => {
    if (!raw) return '';
    let city = String(raw);
    city = city.replace(/\s*-\s*/g, ', ');
    city = city.replace(/\s+/g, ' ').trim();
    return city;
  };

  const normalizeCityKey = (raw) => {
    if (!raw) return '';
    let city = normalizeCityLabel(raw);
    city = city.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    city = city.toUpperCase();
    return city;
  };

  draws.forEach(draw => {
    if (draw.cidadeSorteio) {
      totalDrawsWithLocation++;

      const cityLabel = normalizeCityLabel(draw.cidadeSorteio);
      const cityKey = normalizeCityKey(draw.cidadeSorteio);

      if (!cityGroups[cityKey]) {
        cityGroups[cityKey] = {
          name: cityLabel,
          count: 0,
          totalWinners: 0,
          totalAccumulated: 0,
          draws: []
        };
      }
      const cityGroup = cityGroups[cityKey];
      cityGroup.count++;
      cityGroup.totalWinners += (draw.ganhadores6 || 0);
      if (draw.acumulado) cityGroup.totalAccumulated++;
      cityGroup.draws.push(draw);

      // Analysis by state (extract UF from end of string)
      const stateMatch = cityLabel.match(/,\s*([A-Z]{2})$/);
      if (stateMatch) {
        const state = stateMatch[1];
        if (!states[state]) {
          states[state] = {
            count: 0,
            totalWinners: 0,
            cities: new Set()
          };
        }
        states[state].count++;
        states[state].totalWinners += (draw.ganhadores6 || 0);
        states[state].cities.add(cityGroup.name);
      }
    }
  });

  const cities = {};
  Object.keys(cityGroups).forEach(key => {
    const group = cityGroups[key];
    cities[group.name] = {
      count: group.count,
      totalWinners: group.totalWinners,
      totalAccumulated: group.totalAccumulated,
      draws: group.draws,
      percentage: totalDrawsWithLocation > 0
        ? ((group.count / totalDrawsWithLocation) * 100).toFixed(2)
        : '0.00'
    };
  });

  // Convert sets to arrays and calculate percentages
  Object.keys(states).forEach(state => {
    states[state].cities = Array.from(states[state].cities);
    states[state].percentage = ((states[state].count / totalDrawsWithLocation) * 100).toFixed(2);
  });

  return { cities, states, totalDrawsWithLocation };
}
