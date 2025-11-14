/**
 * Formatting utilities
 */

/**
 * Formats a number as Brazilian currency
 * @param {number} value - Value to format
 * @returns {string} Formatted currency
 */
export function formatCurrency(value) {
  if (!value || value === 0) return 'R$ 0,00';

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formats a date string from DD/MM/YYYY to a Date object
 * @param {string} dateStr - Date string in Brazilian format
 * @returns {Date} Date object
 */
export function parseDate(dateStr) {
  if (!dateStr) return new Date();
  const parts = dateStr.split('/');
  if (parts.length !== 3) return new Date();
  return new Date(parts[2], parts[1] - 1, parts[0]);
}

/**
 * Formats a Date object to DD/MM/YYYY
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return '';
  if (!(date instanceof Date)) return String(date);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formats a number with thousands separator
 * @param {number} value - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(value) {
  if (!value && value !== 0) return '0';
  return new Intl.NumberFormat('pt-BR').format(value);
}

/**
 * Formats a percentage
 * @param {number} value - Value to format (0-100)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 2) {
  if (!value && value !== 0) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Formats lottery numbers with leading zeros
 * @param {number} num - Number to format
 * @returns {string} Formatted number (01, 02, etc.)
 */
export function formatLotteryNumber(num) {
  return String(num).padStart(2, '0');
}

/**
 * Gets relative time (e.g., "há 3 dias")
 * @param {Date} date - Date to compare
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  if (!date) return '';

  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 7) return `Há ${days} dias`;
  if (days < 30) return `Há ${Math.floor(days / 7)} semanas`;
  if (days < 365) return `Há ${Math.floor(days / 30)} meses`;
  return `Há ${Math.floor(days / 365)} anos`;
}

/**
 * Truncates text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalizes first letter
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Gets month name in Portuguese
 * @param {number} month - Month number (0-11)
 * @returns {string} Month name
 */
export function getMonthName(month) {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[month] || '';
}

/**
 * Gets short month name in Portuguese
 * @param {number} month - Month number (0-11)
 * @returns {string} Short month name
 */
export function getShortMonthName(month) {
  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  return months[month] || '';
}
