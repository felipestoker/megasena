/**
 * Application configuration constants
 */

export const API_CONFIG = {
  // Use Vite dev proxy (see vite.config.js) to avoid CORS issues
  BASE_URL: '/api/megasena',
  PROXY_URL: '',
  BATCH_SIZE: 5,
  RETRY_DELAY: 200,
  CACHE_DURATION: {
    QUICK: 2 * 60 * 60 * 1000, // 2 hours
    FULL: 24 * 60 * 60 * 1000, // 24 hours
  },
};

export const CACHE_KEYS = {
  DRAWS: 'megasena_draws',
  LAST_UPDATE: 'megasena_last_update',
  FULL_DATA_LOADED: 'megasena_full_data_loaded',
};

export const LOTTERY_CONFIG = {
  MIN_NUMBER: 1,
  MAX_NUMBER: 60,
  NUMBERS_PER_DRAW: 6,
};

export const PERIOD_OPTIONS = [
  { value: 'last50', label: 'Últimos 50 concursos' },
  { value: 'last100', label: 'Últimos 100 concursos' },
  { value: 'last200', label: 'Últimos 200 concursos' },
  { value: 'lastYear', label: 'Último ano' },
  { value: 'all', label: 'Todos os concursos' },
];

export const SUGGESTION_TYPES = [
  { value: 'balanced', label: '⚖️ Balanceado' },
  { value: 'frequent', label: '🔥 Mais Frequentes' },
  { value: 'rare', label: '❄️ Menos Frequentes' },
  { value: 'hot', label: '🌡️ Quentes (Recentes)' },
  { value: 'cold', label: '🧊 Frios (Atrasados)' },
  { value: 'high', label: '⬆️ Números Altos' },
  { value: 'low', label: '⬇️ Números Baixos' },
];

export const DELAY_CATEGORIES = {
  RECENT: { label: 'Recente', color: 'green', max: 8 },
  MEDIUM: { label: 'Médio', color: 'yellow', max: 15 },
  DELAYED: { label: 'Atrasado', color: 'red', max: Infinity },
};

export const REGIONS = {
  AC: 'Norte',
  AL: 'Nordeste',
  AP: 'Norte',
  AM: 'Norte',
  BA: 'Nordeste',
  CE: 'Nordeste',
  DF: 'Centro-Oeste',
  ES: 'Sudeste',
  GO: 'Centro-Oeste',
  MA: 'Nordeste',
  MT: 'Centro-Oeste',
  MS: 'Centro-Oeste',
  MG: 'Sudeste',
  PA: 'Norte',
  PB: 'Nordeste',
  PR: 'Sul',
  PE: 'Nordeste',
  PI: 'Nordeste',
  RJ: 'Sudeste',
  RN: 'Nordeste',
  RS: 'Sul',
  RO: 'Norte',
  RR: 'Norte',
  SC: 'Sul',
  SP: 'Sudeste',
  SE: 'Nordeste',
  TO: 'Norte',
};

export const CHART_COLORS = {
  primary: '#10b981',
  secondary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  green: '#10b981',
  blue: '#3b82f6',
  yellow: '#f59e0b',
  red: '#ef4444',
  purple: '#a855f7',
  pink: '#ec4899',
};
