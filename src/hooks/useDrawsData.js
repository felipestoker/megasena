/**
 * Custom hook for managing lottery draws data
 */

import { useState, useCallback, useEffect } from 'react';
import { fetchLatestDraw, fetchDrawsBatch } from '../services/megasenaAPI';
import {
  saveDrawsToCache,
  getDrawsFromCache,
  isCacheValid,
  isFullDataLoaded as checkFullDataLoaded,
  setFullDataLoaded,
} from '../services/cacheService';

export function useDrawsData() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const [isFullDataLoaded, setIsFullDataLoadedState] = useState(false);

  /**
   * Fetches draws from API
   */
  const fetchDraws = useCallback(async (mode = 'quick') => {
    setLoading(true);
    setError(null);
    setLoadingProgress({ current: 0, total: 0 });

    try {
      // Check cache first
      if (isCacheValid(mode)) {
        const cachedDraws = getDrawsFromCache();
        if (cachedDraws && cachedDraws.length > 0) {
          console.log(`Using cached data (${cachedDraws.length} draws)`);
          setDraws(cachedDraws);
          setIsFullDataLoadedState(checkFullDataLoaded());
          setLoading(false);
          return;
        }
      }

      // Fetch latest draw to get current contest number
      console.log('Fetching latest draw...');
      const latest = await fetchLatestDraw();
      const latestNumber = latest.numero;

      console.log(`Latest contest: ${latestNumber}`);

      // Determine how many contests to fetch
      const contestsToFetch = mode === 'quick' ? 100 : latestNumber;
      const startContest = latestNumber - contestsToFetch + 1;

      console.log(`Fetching contests ${startContest} to ${latestNumber}...`);

      // Fetch draws in batches
      const fetchedDraws = await fetchDrawsBatch(
        startContest,
        latestNumber,
        setLoadingProgress
      );

      // Sort by contest number (descending)
      fetchedDraws.sort((a, b) => b.concurso - a.concurso);

      console.log(`Fetched ${fetchedDraws.length} draws successfully`);

      // Save to cache
      saveDrawsToCache(fetchedDraws);

      // Set full data loaded flag if appropriate
      if (mode === 'full') {
        setFullDataLoaded(true);
        setIsFullDataLoadedState(true);
      }

      setDraws(fetchedDraws);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching draws:', err);

      // Try to use cached data as fallback
      const cachedDraws = getDrawsFromCache();
      if (cachedDraws && cachedDraws.length > 0) {
        console.log('Using cached data as fallback');
        setDraws(cachedDraws);
        setError('Usando dados em cache. Não foi possível atualizar.');
      } else {
        setError('Erro ao carregar dados. Tente novamente.');
      }

      setLoading(false);
    }
  }, []);

  /**
   * Loads full historical data
   */
  const loadFullData = useCallback(async () => {
    await fetchDraws('full');
  }, [fetchDraws]);

  /**
   * Refetches draws
   */
  const refetch = useCallback(() => {
    fetchDraws('quick');
  }, [fetchDraws]);

  // Load initial data
  useEffect(() => {
    fetchDraws('quick');
  }, [fetchDraws]);

  return {
    draws,
    loading,
    loadingProgress,
    error,
    isFullDataLoaded,
    fetchDraws,
    loadFullData,
    refetch,
  };
}
