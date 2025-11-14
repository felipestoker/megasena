/**
 * Custom hook for statistical calculations
 */

import { useMemo } from 'react';
import {
  calculateNumberFrequency,
  analyzeDelays,
  findFrequentPairs,
  analyzePatterns,
  analyzeGeography,
} from '../utils/statisticalAnalysis';

export function useStatistics(filteredDraws, allDraws = null) {
  /**
   * Number frequency analysis
   */
  const numberFrequency = useMemo(() => {
    if (!filteredDraws || filteredDraws.length === 0) return [];
    return calculateNumberFrequency(filteredDraws);
  }, [filteredDraws]);

  /**
   * Delay analysis
   */
  const delayAnalysis = useMemo(() => {
    if (!numberFrequency || numberFrequency.length === 0) return [];
    return analyzeDelays(numberFrequency);
  }, [numberFrequency]);

  /**
   * Frequent pairs analysis
   */
  const frequentPairs = useMemo(() => {
    if (!filteredDraws || filteredDraws.length === 0) return [];
    return findFrequentPairs(filteredDraws, 20);
  }, [filteredDraws]);

  /**
   * Pattern analysis (par/ímpar, alto/baixo, etc.)
   */
  const patternAnalysis = useMemo(() => {
    if (!filteredDraws || filteredDraws.length === 0) return null;
    return analyzePatterns(filteredDraws);
  }, [filteredDraws]);

  /**
   * Geographic analysis
   */
  const geographicAnalysis = useMemo(() => {
    const drawsToAnalyze = allDraws || filteredDraws;
    if (!drawsToAnalyze || drawsToAnalyze.length === 0) {
      return { cities: {}, states: {}, totalDrawsWithLocation: 0 };
    }
    return analyzeGeography(drawsToAnalyze);
  }, [allDraws, filteredDraws]);

  /**
   * Top 10 most frequent numbers
   */
  const topFrequent = useMemo(() => {
    return numberFrequency.slice(0, 10);
  }, [numberFrequency]);

  /**
   * Top 10 least frequent numbers
   */
  const topRare = useMemo(() => {
    return [...numberFrequency].reverse().slice(0, 10);
  }, [numberFrequency]);

  /**
   * Most delayed numbers
   */
  const topDelayed = useMemo(() => {
    return delayAnalysis.slice(0, 30);
  }, [delayAnalysis]);

  /**
   * Statistical summary
   */
  const summary = useMemo(() => {
    if (!filteredDraws || filteredDraws.length === 0) {
      return {
        totalDraws: 0,
        totalNumbers: 0,
        avgFrequency: 0,
        maxFrequency: 0,
        minFrequency: 0,
        megaViradaCount: 0,
      };
    }

    const frequencies = numberFrequency.map(n => n.count);
    const megaViradaCount = filteredDraws.filter(d => d.isMegaDaVirada).length;

    return {
      totalDraws: filteredDraws.length,
      totalNumbers: filteredDraws.length * 6,
      avgFrequency: frequencies.reduce((a, b) => a + b, 0) / frequencies.length,
      maxFrequency: Math.max(...frequencies),
      minFrequency: Math.min(...frequencies),
      megaViradaCount,
    };
  }, [filteredDraws, numberFrequency]);

  return {
    // Raw data
    numberFrequency,
    delayAnalysis,
    frequentPairs,
    patternAnalysis,
    geographicAnalysis,

    // Filtered/Top data
    topFrequent,
    topRare,
    topDelayed,

    // Summary
    summary,
  };
}
