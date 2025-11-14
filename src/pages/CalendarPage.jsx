/**
 * CalendarPage Component
 * Monthly calendar view of draws
 */

import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Calendar as CalendarIcon,
  MapPin,
  Award,
  Users,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import NumberBall from '../components/common/NumberBall';
import { parseDate, formatCurrency, formatNumber, getMonthName } from '../utils/formatters';

const CalendarPage = React.memo(({ draws }) => {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDraw, setSelectedDraw] = useState(null);

  if (!draws || draws.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-lg">
            Nenhum sorteio disponível para exibir no calendário.
          </p>
        </div>
      </div>
    );
  }

  const drawsByMonth = useMemo(() => {
    const map = {};

    draws.forEach((draw) => {
      const date = parseDate(draw.data);
      if (!(date instanceof Date) || Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!map[key]) {
        map[key] = [];
      }

      map[key].push({ ...draw, _date: date });
    });

    return map;
  }, [draws]);

  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    const monthDraws = drawsByMonth[monthKey] || [];

    for (let i = 0; i < startingDay; i += 1) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dayDraws = monthDraws.filter((draw) => draw._date.getDate() === day);

      days.push({
        day,
        draws: dayDraws,
        hasDraws: dayDraws.length > 0,
      });
    }

    return days;
  }, [calendarDate, drawsByMonth]);

  const currentMonthKey = `${calendarDate.getFullYear()}-${String(
    calendarDate.getMonth() + 1,
  ).padStart(2, '0')}`;
  const currentMonthDraws = drawsByMonth[currentMonthKey] || [];

  const navigateMonth = (direction) => {
    setCalendarDate((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + direction);
      return next;
    });
    setSelectedDraw(null);
  };

  const handleSelectDraw = (draw) => {
    setSelectedDraw(draw);
  };

  const monthName = getMonthName(calendarDate.getMonth());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-700">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Calendário de Sorteios</h2>
              <p className="text-sm text-gray-600">
                Visualize em quais dias ocorreram sorteios e acesse rápido os detalhes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
            <div className="min-w-[180px] text-center">
              <p className="text-sm text-gray-500">Mês selecionado</p>
              <p className="text-lg font-semibold text-gray-900">
                {monthName} de {calendarDate.getFullYear()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}

          {calendarDays.map((dayData, index) => (
            <div key={index} className="aspect-square">
              {dayData && (
                <div
                  className={`h-full p-1 rounded-lg border-2 transition-colors ${
                    dayData.hasDraws
                      ? 'border-green-300 bg-green-50 hover:bg-green-100 cursor-pointer'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-700 mb-1">{dayData.day}</div>
                  {dayData.hasDraws && (
                    <div className="space-y-1 overflow-y-auto max-h-24">
                      {dayData.draws.map((draw) => (
                        <button
                          key={draw.concurso}
                          type="button"
                          onClick={() => handleSelectDraw(draw)}
                          className={`w-full text-xs rounded px-1 py-0.5 transition-colors text-left ${
                            draw.isMegaDaVirada
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 font-bold shadow'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          #{draw.concurso}
                          {draw.isMegaDaVirada && ' 🎆'}
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
            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded" />
            <span className="text-gray-600">Dias com sorteios</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded" />
            <span className="text-gray-600">Dias sem sorteios</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Resumo do mês</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{currentMonthDraws.length}</div>
            <div className="text-sm text-gray-600">Sorteios no mês</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {currentMonthDraws.filter((d) => d.ganhadores6 > 0).length}
            </div>
            <div className="text-sm text-gray-600">Com ganhador na Sena</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {currentMonthDraws.filter((d) => d.acumulado).length}
            </div>
            <div className="text-sm text-gray-600">Acumulados</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(
                currentMonthDraws.reduce(
                  (sum, d) => sum + (d.valorArrecadado || 0),
                  0,
                ),
              )}
            </div>
            <div className="text-sm text-gray-600">Arrecadação total</div>
          </div>
        </div>
      </div>

      {selectedDraw && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold text-sm">
                Concurso #
                {selectedDraw.concurso}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <CalendarIcon className="w-4 h-4" />
                {selectedDraw.data}
              </span>
              {selectedDraw.isMegaDaVirada && (
                <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-bold text-xs">
                  🎆 MEGA DA VIRADA
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedDraw(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Limpar seleção
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Números sorteados</h4>
              <div className="flex flex-wrap gap-2">
                {selectedDraw.dezenas.map((num) => (
                  <NumberBall
                    key={num}
                    number={num}
                    size="sm"
                    variant={selectedDraw.isMegaDaVirada ? 'megaVirada' : 'default'}
                  />
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Local do sorteio</h4>
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 mt-0.5 text-green-600" />
                <div>
                  <p>{selectedDraw.localSorteio || 'Não informado'}</p>
                  {selectedDraw.cidadeSorteio && (
                    <p className="text-gray-500 text-xs mt-1">
                      Cidade:
                      {' '}
                      {selectedDraw.cidadeSorteio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Premiação</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-green-600" />
                    Sena
                  </span>
                  <span>{formatNumber(selectedDraw.ganhadores6 || 0)} ganhador(es)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    Quina
                  </span>
                  <span>{formatNumber(selectedDraw.ganhadores5 || 0)} ganhador(es)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-purple-600" />
                    Quadra
                  </span>
                  <span>{formatNumber(selectedDraw.ganhadores4 || 0)} ganhador(es)</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-700" />
                    Arrecadação
                  </span>
                  <span className="font-semibold text-green-700">
                    {formatCurrency(selectedDraw.valorArrecadado || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

CalendarPage.propTypes = {
  draws: PropTypes.array.isRequired,
};

CalendarPage.displayName = 'CalendarPage';

export default CalendarPage;

