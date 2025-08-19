import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ScatterChart, Scatter, PieChart, Pie } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Download, Filter, RefreshCw, Award, DollarSign, Users, Activity, Info, ChevronDown, ChevronUp, Loader2, AlertCircle, ArrowLeft, MapPin, Clock, Trophy, Star } from 'lucide-react';
import * as XLSX from 'xlsx';

const App = () => {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('last100');
  const [activeTab, setActiveTab] = useState('frequency');
  const [currentView, setCurrentView] = useState('analysis'); // 'analysis', 'calendar', 'draw-details'
  const [selectedDraw, setSelectedDraw] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [expandedSections, setExpandedSections] = useState({
    statistics: true,
    patterns: true,
    predictions: true
  });
  const [locationFilter, setLocationFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  // Função para buscar dados REAIS da API da Caixa
  const fetchDraws = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLoadingProgress({ current: 0, total: 0 });
    
    try {
      // Primeiro, buscar o último concurso para saber o número atual
      console.log('Buscando último concurso...');
      const latestResponse = await fetch('https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena');
      const latestData = await latestResponse.json();
      const latestNumber = latestData.numero;
      
      console.log(`Último concurso: ${latestNumber}`);
      
      // Buscar TODOS os concursos desde o primeiro (1996)
      const startConcurso = 1; // Primeiro concurso da Mega-Sena foi em 1996
      const concursosParaBuscar = latestNumber;
      
      setLoadingProgress({ current: 0, total: concursosParaBuscar });
      
      const allDraws = [];
      const batchSize = 5; // Buscar em lotes menores para todos os dados
      
      // Buscar concursos em lotes para melhor performance
      console.log(`Buscando ${concursosParaBuscar} concursos (do #1 ao #${latestNumber})...`);
      for (let i = startConcurso; i <= latestNumber; i += batchSize) {
        const batch = [];
        const endBatch = Math.min(i + batchSize - 1, latestNumber);
        
        // Criar promises para buscar em paralelo
        for (let j = i; j <= endBatch; j++) {
          batch.push(
            fetch(`https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/${j}`)
              .then(res => res.json())
              .catch(err => {
                console.error(`Erro ao buscar concurso ${j}:`, err);
                return null;
              })
          );
        }
        
        // Aguardar o lote completar
        const results = await Promise.all(batch);
        
        // Processar resultados
        results.forEach(data => {
          if (data && data.listaDezenas) {
            allDraws.push({
              concurso: data.numero,
              data: data.dataApuracao,
              dezenas: data.listaDezenas.map(Number).sort((a, b) => a - b),
              premiacaoTotal: parseFloat(data.valorEstimadoProximoConcurso || 0),
              valorArrecadado: parseFloat(data.valorArrecadado || 0),
              ganhadores6: data.listaRateioPremio?.find(r => r.descricaoFaixa === "6 acertos")?.numeroDeGanhadores || 0,
              ganhadores5: data.listaRateioPremio?.find(r => r.descricaoFaixa === "5 acertos")?.numeroDeGanhadores || 0,
              ganhadores4: data.listaRateioPremio?.find(r => r.descricaoFaixa === "4 acertos")?.numeroDeGanhadores || 0,
              acumulado: data.acumulado,
              valorAcumulado: parseFloat(data.valorAcumuladoConcurso_0_5 || 0),
              proximoConcurso: data.numeroConcursoProximo,
              dataProximoConcurso: data.dataProximoConcurso,
              localSorteio: data.localSorteio?.localSorteio || '',
              cidadeSorteio: data.nomeMunicipioUFSorteio || '',
              municipiosGanhadores: data.listaMunicipioUFGanhadores || [],
              isMegaDaVirada: data.indicadorConcursoEspecial === 2 || data.data?.includes('31/12') || false,
              premioSena: data.listaRateioPremio?.find(r => r.descricaoFaixa === "6 acertos")?.valorPremio || 0,
              premioQuina: data.listaRateioPremio?.find(r => r.descricaoFaixa === "5 acertos")?.valorPremio || 0,
              premioQuadra: data.listaRateioPremio?.find(r => r.descricaoFaixa === "4 acertos")?.valorPremio || 0,
              premioTotalSena: (() => {
                const senaInfo = data.listaRateioPremio?.find(r => r.descricaoFaixa === "6 acertos");
                if (!senaInfo) return 0;
                
                // Se há ganhadores, calcular total = valor individual × quantidade
                if (senaInfo.numeroDeGanhadores > 0 && senaInfo.valorPremio > 0) {
                  return (senaInfo.valorPremio || 0) * senaInfo.numeroDeGanhadores;
                }
                
                // Se acumulou, usar valor acumulado ou estimado
                const valorAcumulado = parseFloat(data.valorAcumuladoConcurso_0_5 || 0);
                const valorEstimado = parseFloat(data.valorEstimadoProximoConcurso || 0);
                
                // Retornar o maior entre valor acumulado e estimado
                return Math.max(valorAcumulado, valorEstimado);
              })(),
            });
          }
        });
        
        setLoadingProgress({ 
          current: allDraws.length, 
          total: concursosParaBuscar 
        });
        
        // Delay maior para não sobrecarregar a API ao buscar todos os dados
        if (i + batchSize <= latestNumber) {
          await new Promise(resolve => setTimeout(resolve, 200)); // 200ms entre lotes
        }
      }
      
      // Ordenar por concurso (mais recente primeiro)
      allDraws.sort((a, b) => b.concurso - a.concurso);
      
      console.log(`Total de concursos carregados: ${allDraws.length}`);
      setDraws(allDraws);
      
      // Salvar no localStorage para cache
      localStorage.setItem('megasena_data', JSON.stringify(allDraws));
      localStorage.setItem('megasena_data_date', new Date().toISOString());
      
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados da Mega-Sena. Tentando usar cache local...');
      
      // Tentar carregar do cache
      const cachedData = localStorage.getItem('megasena_data');
      if (cachedData) {
        setDraws(JSON.parse(cachedData));
        setError('Usando dados do cache. Clique em "Atualizar" para buscar dados mais recentes.');
      } else {
        setError('Erro ao carregar dados. Por favor, verifique sua conexão e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar dados ao carregar a página
  useEffect(() => {
    // Verificar se há dados em cache recentes (menos de 1 hora)
    const cachedData = localStorage.getItem('megasena_data');
    const cacheDate = localStorage.getItem('megasena_data_date');
    
    if (cachedData && cacheDate) {
      const cacheAge = Date.now() - new Date(cacheDate).getTime();
      const sixHours = 6 * 60 * 60 * 1000; // 6 horas de cache para dados completos
      
      if (cacheAge < sixHours) {
        console.log(`Usando dados do cache completo (${JSON.parse(cachedData).length} concursos)`);
        setDraws(JSON.parse(cachedData));
        return;
      }
    }
    
    // Se não há cache ou é antigo, buscar novos dados
    fetchDraws();
  }, [fetchDraws]);

  // Filtrar dados por período e localização
  const filteredDraws = useMemo(() => {
    if (!draws.length) return [];
    
    let filtered = [];
    
    switch (selectedPeriod) {
      case 'last50':
        filtered = draws.slice(0, 50);
        break;
      case 'last100':
        filtered = draws.slice(0, 100);
        break;
      case 'last200':
        filtered = draws.slice(0, 200);
        break;
      case 'last365':
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        filtered = draws.filter(d => new Date(d.data) >= oneYearAgo);
        break;
      case 'all':
        filtered = draws;
        break;
      default:
        filtered = draws.slice(0, 100);
    }
    
    // Filtrar por cidade do sorteio
    if (locationFilter) {
      filtered = filtered.filter(draw => 
        draw.cidadeSorteio && 
        draw.cidadeSorteio.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }
    
    // Filtrar por estado
    if (stateFilter) {
      filtered = filtered.filter(draw => 
        draw.cidadeSorteio && 
        draw.cidadeSorteio.toLowerCase().includes(stateFilter.toLowerCase())
      );
    }
    
    return filtered;
  }, [draws, selectedPeriod, locationFilter, stateFilter]);

  // Análise de frequência de números
  const numberFrequency = useMemo(() => {
    const freq = {};
    const totalDraws = filteredDraws.length;
    
    for (let i = 1; i <= 60; i++) {
      freq[i] = { number: i, count: 0, percentage: 0, lastSeen: null };
    }
    
    filteredDraws.forEach((draw, index) => {
      draw.dezenas.forEach(num => {
        freq[num].count++;
        if (!freq[num].lastSeen || index < freq[num].lastSeen) {
          freq[num].lastSeen = index;
        }
      });
    });
    
    // Calcular porcentagens e classificação
    const expectedFreq = (totalDraws * 6) / 60;
    const stdDev = Math.sqrt(expectedFreq);
    
    Object.values(freq).forEach(item => {
      item.percentage = totalDraws > 0 ? ((item.count / totalDraws) * 100).toFixed(2) : 0;
      item.delay = item.lastSeen !== null ? item.lastSeen : totalDraws;
      
      // Z-Score para classificação
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
  }, [filteredDraws]);

  // Análise de padrões
  const patternAnalysis = useMemo(() => {
    if (!filteredDraws.length) return null;
    
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
    
    filteredDraws.forEach(draw => {
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
        
        // Distribuição por décadas
        if (num <= 10) patterns.distribuicaoDecadas['01-10']++;
        else if (num <= 20) patterns.distribuicaoDecadas['11-20']++;
        else if (num <= 30) patterns.distribuicaoDecadas['21-30']++;
        else if (num <= 40) patterns.distribuicaoDecadas['31-40']++;
        else if (num <= 50) patterns.distribuicaoDecadas['41-50']++;
        else patterns.distribuicaoDecadas['51-60']++;
      });
      
      const parImparKey = `${parCount}P/${6-parCount}I`;
      patterns.distribuicao[parImparKey] = (patterns.distribuicao[parImparKey] || 0) + 1;
      
      patterns.parImpar.par += parCount;
      patterns.parImpar.impar += (6 - parCount);
      patterns.baixoAlto.baixo += baixoCount;
      patterns.baixoAlto.alto += (6 - baixoCount);
      
      if (hasSequence) patterns.sequencias++;
      if (hasMultiple5) patterns.multiplos5++;
      patterns.somaMedia += soma;
    });
    
    patterns.somaMedia = Math.round(patterns.somaMedia / filteredDraws.length);
    patterns.sequenciasPerc = ((patterns.sequencias / filteredDraws.length) * 100).toFixed(2);
    patterns.multiplos5Perc = ((patterns.multiplos5 / filteredDraws.length) * 100).toFixed(2);
    
    return patterns;
  }, [filteredDraws]);

  // Pares mais frequentes
  const frequentPairs = useMemo(() => {
    const pairs = {};
    
    filteredDraws.forEach(draw => {
      for (let i = 0; i < draw.dezenas.length - 1; i++) {
        for (let j = i + 1; j < draw.dezenas.length; j++) {
          const pair = `${draw.dezenas[i]}-${draw.dezenas[j]}`;
          pairs[pair] = (pairs[pair] || 0) + 1;
        }
      }
    });
    
    return Object.entries(pairs)
      .map(([pair, count]) => ({ pair, count, percentage: ((count / filteredDraws.length) * 100).toFixed(2) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }, [filteredDraws]);

  // Análise de atrasos
  const delayAnalysis = useMemo(() => {
    return numberFrequency
      .map(item => ({
        number: item.number,
        delay: item.delay,
        classification: item.delay > 15 ? 'atrasado' : item.delay > 8 ? 'médio' : 'recente',
        color: item.delay > 15 ? '#dc2626' : item.delay > 8 ? '#f59e0b' : '#10b981'
      }))
      .sort((a, b) => b.delay - a.delay);
  }, [numberFrequency]);

  // Análise geográfica
  const geographicAnalysis = useMemo(() => {
    if (!draws.length) return { cities: {}, states: {}, totalDrawsWithLocation: 0 };
    
    const cities = {};
    const states = {};
    let totalDrawsWithLocation = 0;
    
    draws.forEach(draw => {
      if (draw.cidadeSorteio) {
        totalDrawsWithLocation++;
        
        // Análise por cidade completa
        if (!cities[draw.cidadeSorteio]) {
          cities[draw.cidadeSorteio] = {
            count: 0,
            totalWinners: 0,
            totalAccumulated: 0,
            draws: []
          };
        }
        cities[draw.cidadeSorteio].count++;
        cities[draw.cidadeSorteio].totalWinners += (draw.ganhadores6 || 0);
        if (draw.acumulado) cities[draw.cidadeSorteio].totalAccumulated++;
        cities[draw.cidadeSorteio].draws.push(draw);
        
        // Análise por estado (extrai UF do final da string)
        const stateMatch = draw.cidadeSorteio.match(/,\s*([A-Z]{2})$/);
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
          states[state].cities.add(draw.cidadeSorteio);
        }
      }
    });
    
    // Converter sets para arrays e calcular percentuais
    Object.keys(states).forEach(state => {
      states[state].cities = Array.from(states[state].cities);
      states[state].percentage = ((states[state].count / totalDrawsWithLocation) * 100).toFixed(2);
    });
    
    Object.keys(cities).forEach(city => {
      cities[city].percentage = ((cities[city].count / totalDrawsWithLocation) * 100).toFixed(2);
    });
    
    return { cities, states, totalDrawsWithLocation };
  }, [draws]);

  // Exportar para Excel
  const exportToExcel = () => {
    // Preparar dados para exportação
    const analysisData = numberFrequency.map(item => ({
      'Número': item.number,
      'Frequência': item.count,
      'Porcentagem': item.percentage + '%',
      'Classificação': item.classification,
      'Último Sorteio': item.lastSeen ? `Há ${item.lastSeen} concursos` : 'Nunca',
      'Atraso': item.delay
    }));
    
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
      'Valor Arrecadado': draw.valorArrecadado
    }));
    
    // Criar workbook com múltiplas abas
    const wb = XLSX.utils.book_new();
    
    // Aba de análise
    const ws1 = XLSX.utils.json_to_sheet(analysisData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Análise de Frequência');
    
    // Aba de resultados
    const ws2 = XLSX.utils.json_to_sheet(drawsData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Resultados');
    
    // Aba de pares frequentes
    const pairsData = frequentPairs.map(item => ({
      'Par': item.pair,
      'Frequência': item.count,
      'Porcentagem': item.percentage + '%'
    }));
    const ws3 = XLSX.utils.json_to_sheet(pairsData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Pares Frequentes');
    
    // Salvar arquivo
    XLSX.writeFile(wb, `mega-sena-analise-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Componente de estatística
  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <Icon className="w-8 h-8 opacity-20" style={{ color }} />
      </div>
    </div>
  );

  // Toggle seção
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
  };

  // Função para obter sorteios por mês
  const getDrawsByMonth = useMemo(() => {
    const drawsByMonth = {};
    
    draws.forEach(draw => {
      const date = formatDate(draw.data);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!drawsByMonth[monthKey]) {
        drawsByMonth[monthKey] = [];
      }
      drawsByMonth[monthKey].push(draw);
    });
    
    return drawsByMonth;
  }, [draws]);

  // Função para obter dias do mês com sorteios
  const getCalendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    const monthDraws = getDrawsByMonth[monthKey] || [];
    
    // Dias vazios no início
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDraws = monthDraws.filter(draw => {
        const drawDate = formatDate(draw.data);
        return drawDate.getDate() === day;
      });
      
      days.push({
        day,
        draws: dayDraws,
        hasDraws: dayDraws.length > 0
      });
    }
    
    return days;
  }, [calendarDate, getDrawsByMonth]);

  // Função para navegar entre meses
  const navigateMonth = (direction) => {
    setCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Função para selecionar sorteio
  const selectDraw = (draw) => {
    setSelectedDraw(draw);
    setCurrentView('draw-details');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-700 font-semibold mb-2">Carregando TODOS os dados da Mega-Sena...</p>
          <p className="text-gray-600 text-sm">Buscando histórico completo desde 1996 • Fonte: Caixa Econômica Federal</p>
          {loadingProgress.total > 0 && (
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2 w-48 mx-auto">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {loadingProgress.current} de {loadingProgress.total} concursos
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🎰 Sistema Avançado de Análise da Mega-Sena
              </h1>
              <p className="text-gray-600">
                <span className="font-semibold text-green-600">DADOS REAIS</span> • 
                {draws.length} concursos carregados • 
                Último: #{draws[0]?.concurso} ({draws[0]?.data})
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => setCurrentView(currentView === 'analysis' ? 'calendar' : 'analysis')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  currentView === 'calendar' 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {currentView === 'analysis' ? 'Ver Calendário' : 'Ver Análises'}
              </button>
              <button
                onClick={fetchDraws}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar Excel
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-yellow-800">{error}</span>
            </div>
          )}
        </div>

        {/* Visualização de Detalhes do Sorteio */}
        {currentView === 'draw-details' && selectedDraw && (
          <>
            {/* Header do Sorteio */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentView('calendar')}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar ao Calendário
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  {selectedDraw.data}
                </div>
              </div>
              
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <h2 className="text-4xl font-bold text-gray-800">
                    Concurso #{selectedDraw.concurso}
                  </h2>
                  {selectedDraw.isMegaDaVirada && (
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                      🎊 MEGA DA VIRADA 🎊
                    </div>
                  )}
                </div>
                <div className="flex justify-center gap-2 mb-4">
                  {selectedDraw.dezenas.map(num => (
                    <span
                      key={num}
                      className="inline-block w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white text-center leading-12 font-bold text-lg shadow-lg"
                    >
                      {String(num).padStart(2, '0')}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col items-center gap-2 text-gray-600">
                  {selectedDraw.localSorteio && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedDraw.localSorteio}</span>
                    </div>
                  )}
                  {selectedDraw.cidadeSorteio && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Cidade do Sorteio:</span>
                      <span className="bg-blue-100 px-2 py-1 rounded-full text-blue-700">
                        {selectedDraw.cidadeSorteio}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Detalhes da Premiação */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <h3 className="text-xl font-bold text-gray-800">Sena (6 acertos)</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ganhadores:</span>
                    <span className="font-bold text-2xl text-green-600">
                      {selectedDraw.ganhadores6 || 0}
                    </span>
                  </div>
                  {selectedDraw.ganhadores6 > 0 ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Premiação total:</span>
                        <span className="font-bold text-purple-600 text-lg">
                          R$ {(selectedDraw.premioTotalSena || 0).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Prêmio por ganhador:</span>
                        <span className="font-bold text-green-600">
                          R$ {(selectedDraw.premioSena || 0).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-2">
                      <span className="text-orange-500 font-bold text-lg">ACUMULOU!</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-8 h-8 text-blue-500" />
                  <h3 className="text-xl font-bold text-gray-800">Quina (5 acertos)</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ganhadores:</span>
                    <span className="font-bold text-2xl text-blue-600">
                      {selectedDraw.ganhadores5 || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prêmio por ganhador:</span>
                    <span className="font-bold text-blue-600">
                      R$ {(selectedDraw.premioQuina || 0).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-8 h-8 text-purple-500" />
                  <h3 className="text-xl font-bold text-gray-800">Quadra (4 acertos)</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ganhadores:</span>
                    <span className="font-bold text-2xl text-purple-600">
                      {selectedDraw.ganhadores4 || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prêmio por ganhador:</span>
                    <span className="font-bold text-purple-600">
                      R$ {(selectedDraw.premioQuadra || 0).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações de Localização dos Ganhadores */}
            {selectedDraw.municipiosGanhadores && selectedDraw.municipiosGanhadores.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Cidades dos Ganhadores
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedDraw.municipiosGanhadores.map((municipio, index) => (
                    <div key={index} className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-green-800">
                          {municipio.nomeMunicipioUF}
                        </span>
                        <span className="bg-green-600 text-white px-2 py-1 rounded-full text-sm">
                          {municipio.serie || '1'} ganhador(es)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Informações Adicionais */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Informações do Concurso</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Data do Sorteio:</span>
                    <span className="font-bold">{selectedDraw.data}</span>
                  </div>
                  {selectedDraw.cidadeSorteio && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Cidade do Sorteio:</span>
                      <span className="font-bold text-blue-600">{selectedDraw.cidadeSorteio}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Valor Arrecadado:</span>
                    <span className="font-bold text-green-600">
                      R$ {(selectedDraw.valorArrecadado || 0).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  {selectedDraw.acumulado && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Valor Acumulado:</span>
                      <span className="font-bold text-orange-600">
                        R$ {(selectedDraw.valorAcumulado || 0).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {selectedDraw.proximoConcurso && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Próximo Concurso:</span>
                      <span className="font-bold">#{selectedDraw.proximoConcurso}</span>
                    </div>
                  )}
                  {selectedDraw.dataProximoConcurso && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Data do Próximo:</span>
                      <span className="font-bold">{selectedDraw.dataProximoConcurso}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Status:</span>
                    <span className={`font-bold ${
                      selectedDraw.acumulado ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {selectedDraw.acumulado ? 'Acumulou' : 'Teve ganhador'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Análise dos Números do Sorteio */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Análise dos Números Sorteados</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Distribuição Par/Ímpar</h4>
                  <div className="flex justify-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedDraw.dezenas.filter(n => n % 2 === 0).length}
                      </div>
                      <div className="text-sm text-gray-600">Pares</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {selectedDraw.dezenas.filter(n => n % 2 !== 0).length}
                      </div>
                      <div className="text-sm text-gray-600">Ímpares</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Baixo/Alto</h4>
                  <div className="flex justify-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedDraw.dezenas.filter(n => n <= 30).length}
                      </div>
                      <div className="text-sm text-gray-600">Baixos (1-30)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {selectedDraw.dezenas.filter(n => n > 30).length}
                      </div>
                      <div className="text-sm text-gray-600">Altos (31-60)</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Soma dos Números</h4>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {selectedDraw.dezenas.reduce((sum, num) => sum + num, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Visualização do Calendário */}
        {currentView === 'calendar' && (
          <>
            {/* Controles do Calendário */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Calendário de Sorteios</h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    ←
                  </button>
                  <h3 className="text-xl font-semibold min-w-[200px] text-center">
                    {calendarDate.toLocaleDateString('pt-BR', { 
                      month: 'long', 
                      year: 'numeric' 
                    }).replace(/^\w/, c => c.toUpperCase())}
                  </h3>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>
              
              {/* Grid do Calendário */}
              <div className="grid grid-cols-7 gap-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
                
                {getCalendarDays.map((dayData, index) => (
                  <div key={index} className="aspect-square">
                    {dayData && (
                      <div className={`h-full p-1 rounded-lg border-2 transition-colors ${
                        dayData.hasDraws 
                          ? 'border-green-300 bg-green-50 hover:bg-green-100 cursor-pointer' 
                          : 'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="font-semibold text-sm text-gray-700 mb-1">
                          {dayData.day}
                        </div>
                        {dayData.hasDraws && (
                          <div className="space-y-1">
                            {dayData.draws.map(draw => (
                              <button
                                key={draw.concurso}
                                onClick={() => selectDraw(draw)}
                                className={`w-full text-xs rounded px-1 py-0.5 transition-colors ${
                                  draw.isMegaDaVirada 
                                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 font-bold shadow-md' 
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                              >
                                #{draw.concurso}
                                {draw.isMegaDaVirada && ' 🎊'}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                  <span className="text-gray-600">Dias com sorteios</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded"></div>
                  <span className="text-gray-600">Dias sem sorteios</span>
                </div>
              </div>
            </div>
            
            {/* Resumo do Mês */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Resumo do Mês</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {getDrawsByMonth[`${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}`]?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Sorteios no Mês</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {getDrawsByMonth[`${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}`]?.filter(d => d.ganhadores6 > 0).length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Com Ganhador</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {getDrawsByMonth[`${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}`]?.filter(d => d.acumulado).length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Acumulados</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    R$ {(getDrawsByMonth[`${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}`]?.reduce((sum, d) => sum + (d.valorArrecadado || 0), 0) || 0).toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm text-gray-600">Arrecadação Total</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Visualização de Análises */}
        {currentView === 'analysis' && (
          <>
            {/* Filtros */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="space-y-4">
                {/* Filtros de Período */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold">Período de Análise:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'last50', label: 'Últimos 50' },
                      { value: 'last100', label: 'Últimos 100' },
                      { value: 'last200', label: 'Últimos 200' },
                      { value: 'last365', label: 'Último ano' },
                      { value: 'all', label: `Todos (${draws.length})` }
                    ].map(period => (
                      <button
                        key={period.value}
                        onClick={() => setSelectedPeriod(period.value)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          selectedPeriod === period.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Filtros Geográficos */}
                <div className="flex flex-col md:flex-row gap-4 items-center pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold">Filtros Geográficos:</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Cidade:</label>
                      <input
                        type="text"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        placeholder="Ex: São Paulo, Rio de Janeiro..."
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Estado:</label>
                      <select
                        value={stateFilter}
                        onChange={(e) => setStateFilter(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Todos os estados</option>
                        {Object.keys(geographicAnalysis.states).sort().map(state => (
                          <option key={state} value={state}>
                            {state} ({geographicAnalysis.states[state].count} sorteios)
                          </option>
                        ))}
                      </select>
                    </div>
                    {(locationFilter || stateFilter) && (
                      <button
                        onClick={() => {
                          setLocationFilter('');
                          setStateFilter('');
                        }}
                        className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
                      >
                        Limpar Filtros
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Informações do Filtro Atual */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Mostrando {filteredDraws.length} concursos</span>
                  {locationFilter && <span>• Cidade: "{locationFilter}"</span>}
                  {stateFilter && <span>• Estado: {stateFilter}</span>}
                </div>
              </div>
            </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <StatCard
            icon={Award}
            title="Concursos Analisados"
            value={filteredDraws.length}
            subtitle={`De ${filteredDraws[filteredDraws.length-1]?.concurso || 0} a ${filteredDraws[0]?.concurso || 0}`}
            color="#3b82f6"
          />
          <StatCard
            icon={DollarSign}
            title="Maior Premiação Total"
            value={`R$ ${Math.max(...filteredDraws.map(d => d.premioTotalSena || 0)).toLocaleString('pt-BR')}`}
            subtitle={filteredDraws.find(d => d.premioTotalSena === Math.max(...filteredDraws.map(d => d.premioTotalSena || 0)))?.isMegaDaVirada ? 'Mega da Virada' : 'Prêmio total'}
            color="#10b981"
          />
          <StatCard
            icon={Users}
            title="Maior Prêmio Individual"
            value={`R$ ${Math.max(...filteredDraws.map(d => d.premioSena || 0)).toLocaleString('pt-BR')}`}
            subtitle={filteredDraws.find(d => d.premioSena === Math.max(...filteredDraws.map(d => d.premioSena || 0)))?.isMegaDaVirada ? 'Mega da Virada' : 'Por ganhador'}
            color="#3b82f6"
          />
          <StatCard
            icon={Trophy}
            title="Total de Ganhadores"
            value={filteredDraws.reduce((acc, d) => acc + (d.ganhadores6 || 0), 0)}
            subtitle="Sena completa no período"
            color="#f59e0b"
          />
          <StatCard
            icon={Activity}
            title="Soma Média"
            value={patternAnalysis?.somaMedia || 0}
            subtitle="Soma dos 6 números"
            color="#8b5cf6"
          />
          <StatCard
            icon={Star}
            title="Mega da Virada"
            value={filteredDraws.filter(d => d.isMegaDaVirada).length}
            subtitle={`Total: R$ ${Math.max(...filteredDraws.filter(d => d.isMegaDaVirada).map(d => d.premioTotalSena || 0), 0).toLocaleString('pt-BR')}`}
            color="#eab308"
          />
        </div>

        {/* Tabs de Análise */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-2 mb-6 border-b">
            {[
              { id: 'frequency', label: '📊 Frequência' },
              { id: 'delays', label: '⏱️ Atrasos' },
              { id: 'patterns', label: '🎯 Padrões' },
              { id: 'pairs', label: '👥 Pares' },
              { id: 'decades', label: '📈 Décadas' },
              { id: 'geography', label: '🗺️ Geografia' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Conteúdo das Tabs */}
          {activeTab === 'frequency' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Análise de Frequência dos Números</h3>
              
              {/* Números Quentes e Frios */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Top 10 Números Mais Sorteados
                  </h4>
                  <div className="grid grid-cols-5 gap-2">
                    {numberFrequency.slice(0, 10).map(item => (
                      <div
                        key={item.number}
                        className="bg-white rounded-lg p-3 text-center shadow-sm border border-red-200 hover:shadow-md transition-shadow"
                      >
                        <div className="text-2xl font-bold text-red-600">{String(item.number).padStart(2, '0')}</div>
                        <div className="text-xs text-gray-600">{item.count}x</div>
                        <div className="text-xs text-gray-500">{item.percentage}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5" />
                    Top 10 Números Menos Sorteados
                  </h4>
                  <div className="grid grid-cols-5 gap-2">
                    {numberFrequency.slice(-10).reverse().map(item => (
                      <div
                        key={item.number}
                        className="bg-white rounded-lg p-3 text-center shadow-sm border border-blue-200 hover:shadow-md transition-shadow"
                      >
                        <div className="text-2xl font-bold text-blue-600">{String(item.number).padStart(2, '0')}</div>
                        <div className="text-xs text-gray-600">{item.count}x</div>
                        <div className="text-xs text-gray-500">{item.percentage}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gráfico de Barras */}
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={numberFrequency}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="number" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        return (
                          <div className="bg-white p-2 border rounded shadow">
                            <p className="font-semibold">Número {payload[0].payload.number}</p>
                            <p>Frequência: {payload[0].value}</p>
                            <p>Porcentagem: {payload[0].payload.percentage}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" name="Frequência">
                    {numberFrequency.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'delays' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Análise de Atrasos (Concursos sem aparecer)</h3>
              
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-semibold text-red-700 mb-2">⚠️ Muito Atrasados (15+ jogos)</h4>
                    <div className="flex flex-wrap gap-2">
                      {delayAnalysis.filter(d => d.delay > 15).slice(0, 10).map(item => (
                        <span
                          key={item.number}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold"
                        >
                          {String(item.number).padStart(2, '0')} ({item.delay})
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-700 mb-2">⏳ Atraso Médio (8-15 jogos)</h4>
                    <div className="flex flex-wrap gap-2">
                      {delayAnalysis.filter(d => d.delay > 8 && d.delay <= 15).slice(0, 10).map(item => (
                        <span
                          key={item.number}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold"
                        >
                          {String(item.number).padStart(2, '0')} ({item.delay})
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-700 mb-2">✅ Recentes (0-8 jogos)</h4>
                    <div className="flex flex-wrap gap-2">
                      {delayAnalysis.filter(d => d.delay <= 8).slice(0, 10).map(item => (
                        <span
                          key={item.number}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold"
                        >
                          {String(item.number).padStart(2, '0')} ({item.delay})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={delayAnalysis.slice(0, 30)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="number" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="delay" name="Concursos de atraso">
                    {delayAnalysis.slice(0, 30).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'patterns' && patternAnalysis && (
            <div>
              <h3 className="text-xl font-bold mb-4">Análise de Padrões</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Distribuição Par/Ímpar */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Distribuição Par/Ímpar</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pares', value: patternAnalysis.parImpar.par },
                          { name: 'Ímpares', value: patternAnalysis.parImpar.impar }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Distribuição Baixo/Alto */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Distribuição Baixo (1-30) / Alto (31-60)</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Baixos (1-30)', value: patternAnalysis.baixoAlto.baixo },
                          { name: 'Altos (31-60)', value: patternAnalysis.baixoAlto.alto }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Estatísticas Adicionais */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Padrões Especiais</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jogos com sequências:</span>
                      <span className="font-semibold">{patternAnalysis.sequenciasPerc}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jogos com múltiplos de 5:</span>
                      <span className="font-semibold">{patternAnalysis.multiplos5Perc}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Soma média dos números:</span>
                      <span className="font-semibold">{patternAnalysis.somaMedia}</span>
                    </div>
                  </div>
                </div>

                {/* Distribuições mais comuns */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Distribuições Par/Ímpar mais comuns</h4>
                  <div className="space-y-1">
                    {Object.entries(patternAnalysis.distribuicao)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([pattern, count]) => (
                        <div key={pattern} className="flex justify-between text-sm">
                          <span className="text-gray-600">{pattern}:</span>
                          <span className="font-semibold">{count} jogos ({((count/filteredDraws.length)*100).toFixed(1)}%)</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pairs' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Pares Mais Frequentes</h3>
              <p className="text-gray-600 mb-4">Duplas de números que mais aparecem juntas</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {frequentPairs.map((item, index) => (
                  <div
                    key={item.pair}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-purple-700 text-lg">{item.pair}</span>
                      <div className="text-right">
                        <span className="text-sm bg-purple-100 px-2 py-1 rounded text-purple-600 block">
                          {item.count}x
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'decades' && patternAnalysis && (
            <div>
              <h3 className="text-xl font-bold mb-4">Distribuição por Décadas</h3>
              <p className="text-gray-600 mb-4">Frequência de números por faixa</p>
              
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={Object.entries(patternAnalysis.distribuicaoDecadas).map(([decade, count]) => ({
                    decade,
                    count,
                    percentage: ((count / (filteredDraws.length * 6)) * 100).toFixed(2)
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="decade" />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        return (
                          <div className="bg-white p-2 border rounded shadow">
                            <p className="font-semibold">Faixa: {payload[0].payload.decade}</p>
                            <p>Frequência: {payload[0].value}</p>
                            <p>Porcentagem: {payload[0].payload.percentage}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'geography' && (
            <div>
              <h3 className="text-xl font-bold mb-4">Análise Geográfica dos Sorteios</h3>
              
              {/* Estatísticas Gerais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-700 mb-2">📍 Total de Locais</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.keys(geographicAnalysis.cities).length}
                  </div>
                  <div className="text-sm text-gray-600">Cidades diferentes</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-700 mb-2">🏛️ Estados</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {Object.keys(geographicAnalysis.states).length}
                  </div>
                  <div className="text-sm text-gray-600">Estados com sorteios</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-700 mb-2">📊 Com Localização</h4>
                  <div className="text-2xl font-bold text-purple-600">
                    {geographicAnalysis.totalDrawsWithLocation}
                  </div>
                  <div className="text-sm text-gray-600">
                    {((geographicAnalysis.totalDrawsWithLocation / draws.length) * 100).toFixed(1)}% do total
                  </div>
                </div>
              </div>

              {/* Top Cidades */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">🏆 Top 10 Cidades com Mais Sorteios</h4>
                  <div className="space-y-2">
                    {Object.entries(geographicAnalysis.cities)
                      .sort((a, b) => b[1].count - a[1].count)
                      .slice(0, 10)
                      .map(([city, data], index) => (
                        <div key={city} className="flex justify-between items-center py-2 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-500 w-6">#{index + 1}</span>
                            <span className="font-medium">{city}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-blue-600">{data.count} sorteios</span>
                            <div className="text-xs text-gray-500">{data.percentage}%</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">🏛️ Estatísticas por Estado</h4>
                  <div className="space-y-2">
                    {Object.entries(geographicAnalysis.states)
                      .sort((a, b) => b[1].count - a[1].count)
                      .slice(0, 10)
                      .map(([state, data]) => (
                        <div key={state} className="flex justify-between items-center py-2 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-green-600 w-8">{state}</span>
                            <span className="text-sm text-gray-600">{data.cities.length} cidades</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-green-600">{data.count} sorteios</span>
                            <div className="text-xs text-gray-500">{data.percentage}%</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Seção Mega da Virada */}
              {filteredDraws.some(d => d.isMegaDaVirada) && (
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 border-2 border-yellow-300 mb-6">
                  <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                    🎊 Mega da Virada - Análise Especial
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {filteredDraws.filter(d => d.isMegaDaVirada).map(draw => (
                      <div key={draw.concurso} className="bg-white rounded-lg p-3 border border-yellow-300">
                        <div className="text-sm font-bold text-yellow-800">#{draw.concurso} - {draw.data}</div>
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-purple-600">
                            Total: R$ {(draw.premioTotalSena || 0).toLocaleString('pt-BR')}
                          </div>
                          <div className="text-md font-bold text-green-600">
                            Individual: R$ {(draw.premioSena || 0).toLocaleString('pt-BR')}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {draw.ganhadores6} ganhador(es) • {draw.cidadeSorteio}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gráfico de Estados */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-3">📊 Distribuição de Sorteios por Estado</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={Object.entries(geographicAnalysis.states)
                      .map(([state, data]) => ({
                        state,
                        count: data.count,
                        percentage: data.percentage
                      }))
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 15)
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="state" />
                    <YAxis />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          return (
                            <div className="bg-white p-2 border rounded shadow">
                              <p className="font-semibold">Estado: {payload[0].payload.state}</p>
                              <p>Sorteios: {payload[0].value}</p>
                              <p>Porcentagem: {payload[0].payload.percentage}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Seção de Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('predictions')}
          >
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Info className="w-5 h-5" />
              Insights Baseados em Dados Reais
            </h3>
            {expandedSections.predictions ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {expandedSections.predictions && (
            <div className="mt-4 space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-700 mb-2">📊 Análise Estatística Real</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Baseado em {filteredDraws.length} concursos oficiais da Caixa</li>
                  <li>• A distribuição mais comum é 3 pares e 3 ímpares</li>
                  <li>• Números entre 1-30 e 31-60 tendem a se equilibrar</li>
                  <li>• Sequências aparecem em {patternAnalysis?.sequenciasPerc}% dos jogos</li>
                  <li>• A soma média dos números é {patternAnalysis?.somaMedia}</li>
                </ul>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-700 mb-2">🎯 Números em Destaque</h4>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>• <strong>Mais sorteados:</strong> {numberFrequency.slice(0, 5).map(n => String(n.number).padStart(2, '0')).join(', ')}</p>
                  <p>• <strong>Menos sorteados:</strong> {numberFrequency.slice(-5).map(n => String(n.number).padStart(2, '0')).join(', ')}</p>
                  <p>• <strong>Mais atrasados:</strong> {delayAnalysis.slice(0, 5).map(n => String(n.number).padStart(2, '0')).join(', ')}</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-700 mb-2">⚠️ Importante</h4>
                <p className="text-sm text-gray-700">
                  Estas análises são baseadas em dados históricos REAIS da Mega-Sena. 
                  Cada sorteio é independente e aleatório. As estatísticas mostram padrões passados, 
                  mas não garantem resultados futuros. Jogue com responsabilidade.
                </p>
              </div>
            </div>
          )}
        </div>

            {/* Últimos Resultados */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Últimos 15 Resultados Oficiais</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-2 px-2">Concurso</th>
                      <th className="text-left py-2 px-2">Data</th>
                      <th className="text-left py-2 px-2">Números Sorteados</th>
                      <th className="text-left py-2 px-2">Ganhadores</th>
                      <th className="text-left py-2 px-2">Prêmio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDraws.slice(0, 15).map((draw, index) => (
                      <tr key={draw.concurso} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${draw.isMegaDaVirada ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''}`}>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">#{draw.concurso}</span>
                            {draw.isMegaDaVirada && (
                              <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                VIRADA
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-2">{draw.data}</td>
                        <td className="py-2 px-2">
                          <div className="flex gap-1">
                            {draw.dezenas.map(num => (
                              <span
                                key={num}
                                className="inline-block w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white text-center leading-8 font-bold text-sm shadow-sm"
                              >
                                {String(num).padStart(2, '0')}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          {draw.ganhadores6 > 0 ? (
                            <span className="text-green-600 font-bold">{draw.ganhadores6} 🏆</span>
                          ) : (
                            <span className="text-orange-500 font-semibold">ACUMULOU</span>
                          )}
                        </td>
                        <td className="py-2 px-2 font-semibold">
                          {draw.ganhadores6 > 0 
                            ? `R$ ${(draw.premioSena || 0).toLocaleString('pt-BR')}`
                            : `Acumulado: R$ ${(draw.valorAcumulado || 0).toLocaleString('pt-BR')}`
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;