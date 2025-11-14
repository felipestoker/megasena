/**
 * Custom hook for managing draw filters
 */

import { useState, useMemo } from 'react';
import { REGIONS } from '../constants/config';

export function useFilters(draws) {
  const [selectedPeriod, setSelectedPeriod] = useState('last100');
  const [locationFilter, setLocationFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [prizeTierFilter, setPrizeTierFilter] = useState('');

  /**
   * Filters draws based on selected criteria
   */
  const filteredDraws = useMemo(() => {
    if (!draws || draws.length === 0) return [];

    let filtered = [...draws];

    // Period filter
    if (selectedPeriod !== 'all') {
      if (selectedPeriod === 'last50') {
        filtered = filtered.slice(0, 50);
      } else if (selectedPeriod === 'last100') {
        filtered = filtered.slice(0, 100);
      } else if (selectedPeriod === 'last200') {
        filtered = filtered.slice(0, 200);
      } else if (selectedPeriod === 'lastYear') {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        filtered = filtered.filter(draw => {
          const drawDate = parseDate(draw.data);
          return drawDate >= oneYearAgo;
        });
      }
    }

    // Location filter (city)
    if (locationFilter) {
      filtered = filtered.filter(draw => {
        const matchesDrawCity = draw.cidadeSorteio?.toLowerCase().includes(locationFilter.toLowerCase());
        const matchesWinnerCity = draw.municipiosGanhadores?.some(m =>
          m.cidade?.toLowerCase().includes(locationFilter.toLowerCase())
        );
        return matchesDrawCity || matchesWinnerCity;
      });
    }

    // State filter
    if (stateFilter) {
      filtered = filtered.filter(draw => {
        const matchesDrawState = draw.cidadeSorteio?.includes(stateFilter);
        const matchesWinnerState = draw.municipiosGanhadores?.some(m =>
          m.cidade?.includes(stateFilter)
        );
        return matchesDrawState || matchesWinnerState;
      });
    }

    // Region filter
    if (regionFilter) {
      filtered = filtered.filter(draw => {
        const getStateFromCity = (city) => {
          if (!city) return null;
          const parts = city.split(',');
          return parts.length > 1 ? parts[1].trim() : null;
        };

        const drawState = getStateFromCity(draw.cidadeSorteio);
        const matchesDrawRegion = drawState && REGIONS[drawState] === regionFilter;

        const matchesWinnerRegion = draw.municipiosGanhadores?.some(m => {
          const winnerState = getStateFromCity(m.cidade);
          return winnerState && REGIONS[winnerState] === regionFilter;
        });

        return matchesDrawRegion || matchesWinnerRegion;
      });
    }

    // Prize tier filter
    if (prizeTierFilter) {
      filtered = filtered.filter(draw => {
        if (prizeTierFilter === 'sena') {
          return draw.ganhadores6 > 0;
        } else if (prizeTierFilter === 'quina') {
          return draw.ganhadores5 > 0;
        } else if (prizeTierFilter === 'quadra') {
          return draw.ganhadores4 > 0;
        }
        return true;
      });
    }

    return filtered;
  }, [draws, selectedPeriod, locationFilter, stateFilter, regionFilter, prizeTierFilter]);

  /**
   * Resets all filters
   */
  const resetFilters = () => {
    setSelectedPeriod('last100');
    setLocationFilter('');
    setStateFilter('');
    setRegionFilter('');
    setPrizeTierFilter('');
  };

  /**
   * Checks if any filter is active
   */
  const hasActiveFilters = useMemo(() => {
    return (
      selectedPeriod !== 'last100' ||
      locationFilter !== '' ||
      stateFilter !== '' ||
      regionFilter !== '' ||
      prizeTierFilter !== ''
    );
  }, [selectedPeriod, locationFilter, stateFilter, regionFilter, prizeTierFilter]);

  return {
    // Filtered data
    filteredDraws,

    // Filter values
    selectedPeriod,
    locationFilter,
    stateFilter,
    regionFilter,
    prizeTierFilter,

    // Filter setters
    setSelectedPeriod,
    setLocationFilter,
    setStateFilter,
    setRegionFilter,
    setPrizeTierFilter,

    // Utilities
    resetFilters,
    hasActiveFilters,
  };
}

/**
 * Parses Brazilian date string to Date object
 * @param {string} dateStr - Date string in format DD/MM/YYYY
 * @returns {Date} Parsed date
 */
function parseDate(dateStr) {
  if (!dateStr) return new Date();
  const parts = dateStr.split('/');
  if (parts.length !== 3) return new Date();
  return new Date(parts[2], parts[1] - 1, parts[0]);
}
