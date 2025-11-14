/**
 * Custom hook for managing lottery draws data with IndexedDB
 * VERSION 2: Uses IndexedDB for instant loading + incremental sync
 */

import { useState, useCallback, useEffect } from 'react';
import { getAllDraws } from '../services/indexedDBService';
import { smartSync, getSyncStatus } from '../services/syncService';

export function useDrawsData() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, message: '' });
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [needsInitialSync, setNeedsInitialSync] = useState(false);

  /**
   * Loads draws from IndexedDB (INSTANT!)
   */
  const loadDrawsFromDB = useCallback(async () => {
    try {
      console.log('📂 Loading draws from IndexedDB...');
      const localDraws = await getAllDraws();
      console.log(`✅ Loaded ${localDraws.length} draws from IndexedDB`);
      setDraws(localDraws);
      return localDraws;
    } catch (err) {
      console.error('❌ Error loading from IndexedDB:', err);
      throw err;
    }
  }, []);

  /**
   * Checks sync status
   */
  const checkSyncStatus = useCallback(async () => {
    try {
      const status = await getSyncStatus();
      setSyncStatus(status);
      setNeedsInitialSync(status.needsInitialSync);
      return status;
    } catch (err) {
      console.error('❌ Error checking sync status:', err);
      return null;
    }
  }, []);

  /**
   * Performs smart sync (initial or incremental)
   */
  const sync = useCallback(async () => {
    setSyncing(true);
    setError(null);
    setSyncProgress({ current: 0, total: 0, message: 'Iniciando sincronização...' });

    try {
      const result = await smartSync((progress) => {
        setSyncProgress(progress);
      });

      if (result.success) {
        console.log('✅ Sync completed successfully');
        // Reload draws from DB
        const updatedDraws = await loadDrawsFromDB();

        // Update sync status
        await checkSyncStatus();

        return {
          success: true,
          newDraws: result.newDraws || result.totalDraws || 0,
          message: result.message,
        };
      } else {
        throw new Error(result.message || 'Sync failed');
      }
    } catch (err) {
      console.error('❌ Sync error:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message,
      };
    } finally {
      setSyncing(false);
      setSyncProgress({ current: 0, total: 0, message: '' });
    }
  }, [loadDrawsFromDB, checkSyncStatus]);

  /**
   * Initial load: Load from DB immediately, then sync in background
   */
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        setLoading(true);

        // Step 1: Check sync status
        const status = await checkSyncStatus();

        if (!status.hasData) {
          // No data yet, need initial sync
          console.log('🆕 No local data, performing initial sync...');
          setNeedsInitialSync(true);
          setLoading(false);
          return;
        }

        // Step 2: Load data from IndexedDB (INSTANT!)
        const localDraws = await loadDrawsFromDB();

        if (!mounted) return;

        setLoading(false);

        // Step 3: Sync in background (check for new draws)
        console.log('🔄 Checking for updates in background...');
        setSyncing(true);

        const syncResult = await smartSync((progress) => {
          if (mounted) {
            setSyncProgress(progress);
          }
        });

        if (!mounted) return;

        if (syncResult.success && syncResult.newDraws > 0) {
          console.log(`✅ Downloaded ${syncResult.newDraws} new draws`);
          // Reload draws to include new ones
          await loadDrawsFromDB();
        }

        setSyncing(false);
        await checkSyncStatus();
      } catch (err) {
        console.error('❌ Initialization error:', err);
        if (mounted) {
          setError(err.message);
          setLoading(false);
          setSyncing(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [loadDrawsFromDB, checkSyncStatus]);

  /**
   * Manual refresh
   */
  const refresh = useCallback(async () => {
    return await sync();
  }, [sync]);

  return {
    // Data
    draws,

    // Loading states
    loading, // Initial load from IndexedDB
    syncing, // Background sync
    syncProgress,

    // Error
    error,

    // Sync status
    syncStatus,
    needsInitialSync,

    // Actions
    sync,
    refresh,
    loadDrawsFromDB,
  };
}
