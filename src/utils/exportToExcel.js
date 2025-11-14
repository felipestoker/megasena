/**
 * Excel Export Utility
 */

import * as XLSX from 'xlsx';

/**
 * Exports analysis data to Excel file
 * @param {Object} params - Export parameters
 */
export function exportToExcel({
  numberFrequency,
  filteredDraws,
  frequentPairs,
  patternAnalysis,
}) {
  try {
    // Prepare frequency data
    const analysisData = numberFrequency.map(item => ({
      'Número': item.number,
      'Frequência': item.count,
      'Porcentagem': item.percentage + '%',
      'Classificação': item.classification,
      'Último Sorteio': item.lastSeen ? `Há ${item.lastSeen} concursos` : 'Nunca',
      'Atraso': item.delay
    }));

    // Prepare draws data
    const drawsData = filteredDraws.map(draw => ({
      'Concurso': draw.concurso,
      'Data': draw.data,
      'Dezena 1': draw.dezenas[0],
      'Dezena 2': draw.dezenas[1],
      'Dezena 3': draw.dezenas[2],
      'Dezena 4': draw.dezenas[3],
      'Dezena 5': draw.dezenas[4],
      'Dezena 6': draw.dezenas[5],
      'Ganhadores Sena': draw.ganhadores6,
      'Ganhadores Quina': draw.ganhadores5,
      'Ganhadores Quadra': draw.ganhadores4,
      'Acumulado': draw.acumulado ? 'Sim' : 'Não',
      'Valor Arrecadado': draw.valorArrecadado,
      'Mega da Virada': draw.isMegaDaVirada ? 'Sim' : 'Não',
    }));

    // Prepare pairs data
    const pairsData = frequentPairs.map(item => ({
      'Par': item.pair,
      'Frequência': item.count,
      'Porcentagem': item.percentage + '%'
    }));

    // Prepare pattern data
    const patternsData = patternAnalysis ? [
      {
        'Métrica': 'Par/Ímpar',
        'Par': patternAnalysis.parImpar.par,
        'Ímpar': patternAnalysis.parImpar.impar
      },
      {
        'Métrica': 'Baixo/Alto',
        'Baixo (1-30)': patternAnalysis.baixoAlto.baixo,
        'Alto (31-60)': patternAnalysis.baixoAlto.alto
      },
      {
        'Métrica': 'Sequências',
        'Valor': `${patternAnalysis.sequencias} (${patternAnalysis.sequenciasPerc}%)`
      },
      {
        'Métrica': 'Múltiplos de 5',
        'Valor': `${patternAnalysis.multiplos5} (${patternAnalysis.multiplos5Perc}%)`
      },
      {
        'Métrica': 'Soma Média',
        'Valor': patternAnalysis.somaMedia
      }
    ] : [];

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add sheets
    const ws1 = XLSX.utils.json_to_sheet(analysisData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Análise de Frequência');

    const ws2 = XLSX.utils.json_to_sheet(drawsData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Resultados');

    const ws3 = XLSX.utils.json_to_sheet(pairsData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Pares Frequentes');

    if (patternsData.length > 0) {
      const ws4 = XLSX.utils.json_to_sheet(patternsData);
      XLSX.utils.book_append_sheet(wb, ws4, 'Padrões');
    }

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `mega-sena-analise-${date}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);

    return { success: true, filename };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return { success: false, error: error.message };
  }
}
