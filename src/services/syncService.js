/**
 * Sync Service
 * Handles synchronization between IndexedDB and Caixa API
 */

import { fetchLatestDraw, fetchDrawByNumber, fetchDrawsBatch } from './megasenaAPI';
import {
  getAllDraws,
  saveDrawsBatch,
  saveDraw,
  getLatestStoredContest,
  hasData,
  saveMetadata,
  getMetadata,
  getDBStats,
} from './indexedDBService';

/**
 * Performs initial full sync (downloads all historical data)
 * @param {Function} onProgress - Progress callback (current, total, message)
 * @returns {Promise<Object>} Sync result
 */
export async function performInitialSync(onProgress) {
  try {
    console.log('🔄 Starting initial full sync...');

    onProgress && onProgress({ current: 0, total: 0, message: 'Buscando último concurso...' });

    // Get latest contest number from API
    const latestData = await fetchLatestDraw();
    const latestNumber = latestData.numero;

    console.log(`📊 Latest contest: ${latestNumber}`);

    onProgress && onProgress({
      current: 0,
      total: latestNumber,
      message: `Baixando ${latestNumber} concursos...`
    });

    // Download ALL draws from contest 1 to latest
    const allDraws = [];
    const batchSize = 10; // Parallel requests
    let downloadedCount = 0;

    for (let i = 1; i <= latestNumber; i += batchSize) {
      const batchEnd = Math.min(i + batchSize - 1, latestNumber);
      const batch = [];

      for (let j = i; j <= batchEnd; j++) {
        batch.push(fetchDrawByNumber(j));
      }

      const results = await Promise.all(batch);
      const validResults = results.filter(r => r !== null);
      allDraws.push(...validResults);
      downloadedCount += validResults.length;

      // Save batch to IndexedDB immediately to avoid memory issues
      if (validResults.length > 0) {
        await saveDrawsBatch(validResults);
      }

      onProgress && onProgress({
        current: downloadedCount,
        total: latestNumber,
        message: `Baixados ${downloadedCount} de ${latestNumber} concursos...`
      });

      // Small delay to avoid overwhelming the API
      if (batchEnd < latestNumber) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Save sync metadata
    const now = new Date().toISOString();
    await saveMetadata('lastSyncTime', now);
    await saveMetadata('firstSyncTime', now);
    await saveMetadata('latestContest', latestNumber);
    await saveMetadata('totalDraws', allDraws.length);

    console.log(`✅ Initial sync complete! Downloaded ${allDraws.length} draws`);

    return {
      success: true,
      totalDraws: allDraws.length,
      latestContest: latestNumber,
      message: `${allDraws.length} concursos baixados com sucesso!`,
    };
  } catch (error) {
    console.error('❌ Initial sync failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Erro ao baixar histórico completo',
    };
  }
}

/**
 * Performs incremental sync (only downloads new draws)
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Sync result
 */
export async function performIncrementalSync(onProgress) {
  try {
    console.log('🔄 Starting incremental sync...');

    onProgress && onProgress({
      current: 0,
      total: 0,
      message: 'Verificando novos sorteios...'
    });

    // Get latest contest from API
    const latestAPIData = await fetchLatestDraw();
    const latestAPIContest = latestAPIData.numero;

    // Get latest contest from local DB
    const latestLocalContest = await getLatestStoredContest();

    console.log(`📊 API: ${latestAPIContest}, Local: ${latestLocalContest}`);

    // No new draws
    if (latestLocalContest && latestAPIContest <= latestLocalContest) {
      console.log('✅ Already up to date!');
      return {
        success: true,
        newDraws: 0,
        latestContest: latestLocalContest,
        message: 'Já está atualizado!',
      };
    }

    // Calculate how many new draws to download
    const startContest = latestLocalContest ? latestLocalContest + 1 : 1;
    const newDrawsCount = latestAPIContest - startContest + 1;

    console.log(`📥 Downloading ${newDrawsCount} new draws...`);

    onProgress && onProgress({
      current: 0,
      total: newDrawsCount,
      message: `Baixando ${newDrawsCount} novos sorteios...`
    });

    // Download new draws
    const newDraws = await fetchDrawsBatch(
      startContest,
      latestAPIContest,
      (progress) => {
        onProgress && onProgress({
          current: progress.current,
          total: progress.total,
          message: `Baixando sorteio ${startContest + progress.current - 1}...`
        });
      }
    );

    // Save to IndexedDB
    if (newDraws.length > 0) {
      await saveDrawsBatch(newDraws);
      await saveMetadata('lastSyncTime', new Date().toISOString());
      await saveMetadata('latestContest', latestAPIContest);
    }

    console.log(`✅ Incremental sync complete! Downloaded ${newDraws.length} new draws`);

    return {
      success: true,
      newDraws: newDraws.length,
      latestContest: latestAPIContest,
      message: newDraws.length > 0
        ? `${newDraws.length} novos sorteios baixados!`
        : 'Já está atualizado!',
    };
  } catch (error) {
    console.error('❌ Incremental sync failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Erro ao verificar atualizações',
    };
  }
}

/**
 * Smart sync: decides whether to do initial or incremental sync
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Sync result
 */
export async function smartSync(onProgress) {
  const dbHasData = await hasData();

  if (!dbHasData) {
    console.log('🆕 No local data, performing initial sync...');
    return await performInitialSync(onProgress);
  } else {
    console.log('🔄 Local data exists, performing incremental sync...');
    return await performIncrementalSync(onProgress);
  }
}

/**
 * Gets current sync status
 * @returns {Promise<Object>}
 */
export async function getSyncStatus() {
  const stats = await getDBStats();
  const needsInitialSync = !stats.hasData;

  return {
    ...stats,
    needsInitialSync,
    isUpToDate: stats.hasData, // Will be verified by incremental sync
  };
}

/**
 * Forces a full re-sync (clears and downloads everything)
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>}
 */
export async function forceFullResync(onProgress) {
  console.log('🔄 Forcing full re-sync...');

  // Note: We don't clear the DB here to avoid data loss
  // Just download everything again
  return await performInitialSync(onProgress);
}
