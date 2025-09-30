import { EChartsOption, LegendComponentOption, SeriesOption } from 'echarts';

export const ECHARTS_CONFIG_PRESETS = {
  DATA_ZOOM: [
    {
      type: 'slider',
      bottom: '15%',
    },
    {
      type: 'inside',
    },
  ],

  X_AXIS: [
    {
      type: 'time' as const,
    },
  ],
  Y_AXIS: {
    type: 'value' as const,
    position: 'left' as const,
    nameLocation: 'end' as const,
    nameRotate: 90,
    nameGap: 2,
    nameTextStyle: {
      align: 'left' as const,
      verticalAlign: 'bottom' as const,
    },

    axisLine: {
      show: true,
    },
    splitNumber: 1,
    boundaryGap: ['5%', '5%'] as [string, string],

    axisLabel: {
      rotate: 90,
      verticalAlign: 'middle' as const,
      align: 'right' as const,
      hideOverlap: true,
    },
    axisPointer: {
      show: false,
    },
  },
  Y_AXIS_DEFAULT: {
    name: 'Default',
    id: 'default' as const,
    type: 'value' as const,
    show: false,
    boundaryGap: ['5%', '5%'] as [string, string],
  },
  Y_AXIS_BASIC_GAP: 20,
  LEGEND: {
    show: true,
    type: 'scroll',
  },
  GRID: {
    left: '3%',
    right: '4%',
    bottom: '25%',
    top: '10%',
    containLabel: true,
  },
  TOOLTIP: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
    },
    formatter: function (params) {
      if (Array.isArray(params)) {
        const initValue = params.at(0);
        const date =
          initValue && 'axisValueLabel' in initValue
            ? initValue.axisValueLabel
            : 'Undefined Date';
        let result = `<div style="margin-bottom: 4px; font-weight: bold;">${date}</div>`;
        params.forEach((param) => {
          const color = param.color;
          const seriesName = param.seriesName;
          const rawValue =
            param.data && typeof param.data === 'object' && 'v' in param.data
              ? param.data['v'] ?? 'Empty Value'
              : 'Undefined Value';

          // Format the value using Intl.NumberFormat
          const value =
            typeof rawValue === 'number'
              ? new Intl.NumberFormat('ru-RU', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }).format(rawValue)
              : rawValue;

          result += `
            <div style="display: flex; align-items: center; margin: 2px 0;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${color}; margin-right: 8px;"></span>
              <span style="flex: 1;">${seriesName}:</span>
              <span style="font-weight: bold; margin-left: 8px;">${value}</span>
            </div>
          `;
        });
        return result;
      }
      return '';
    },
  } satisfies EChartsOption['tooltip'],
};

export const COLOR_PALETTE = [
  '#5470c6', // Blue
  '#91cc75', // Green
  '#fac858', // Yellow
  '#ee6666', // Red
  '#73c0de', // Light Blue
  '#3ba272', // Dark Green
  '#fc8452', // Orange
  '#9a60b4', // Purple
  '#ea7ccc', // Pink
  '#ff9f7f', // Coral
  '#ffdb5c', // Gold
  '#37a2da', // Sky Blue
  '#32c5e9', // Cyan
  '#67e0e3', // Turquoise
  '#9fe6b8', // Mint
  '#ffd93d', // Bright Yellow
  '#ff6b6b', // Bright Red
  '#4ecdc4', // Teal
  '#45b7d1', // Steel Blue
  '#96ceb4', // Sage Green
];

export const ICONS_PATHS = {
  EXPORT_FILE: 'M12 16l-5-5h3V5h4v6h3l-5 5z',
  IMPORT_FILE: 'M12 8 L17 13 L14 13 L14 19 L10 19 L10 13 L7 13 L12 8 Z',
  SETTINGS:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a1.85 1.85 0 0 0 .16.76l1.48 3.57a1.9 1.9 0 0 1-.5 2.17l-2.76 2.4a1.9 1.9 0 0 1-2.18.2l-3.58-1.48a1.9 1.9 0 0 0-1.52 0l-3.58 1.48a1.9 1.9 0 0 1-2.18-.2l-2.76-2.4a1.9 1.9 0 0 1-.5-2.17l1.48-3.57a1.9 1.9 0 0 0 0-1.52L2.2 7.91a1.9 1.9 0 0 1 .5-2.17l2.76-2.4a1.9 1.9 0 0 1 2.18-.2l3.58 1.48a1.9 1.9 0 0 0 1.52 0l3.58-1.48a1.9 1.9 0 0 1 2.18.2l2.76 2.4a1.9 1.9 0 0 1 .5 2.17l-1.48 3.57a1.9 1.9 0 0 0-.16.76Z',
 };
