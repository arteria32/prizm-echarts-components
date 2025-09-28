import { SeriesOption } from 'echarts';
import {
  DatasetOption,
  XAXisOption,
  YAXisOption,
} from 'echarts/types/dist/shared';
import { Point, PrizmEchartSeries } from './date-chart.component';
import { COLOR_PALETTE, ECHARTS_CONFIG_PRESETS } from './constants';

// Helper functions for percent format conversion
export function parsePercentToNumber(percentValue: string): number {
  if (typeof percentValue === 'string' && percentValue.endsWith('%')) {
    return parseFloat(percentValue.replace('%', ''));
  }
  return parseFloat(percentValue) || 5;
}

export function formatNumberToPercent(numberValue: number): string {
  return `${numberValue}%`;
}

// Mock data generator function
export function generateMockData(
  seriesCount: number = 3,
  pointsPerSeries: number = 10
): PrizmEchartSeries[] {
  const mockSeries: PrizmEchartSeries[] = [];

  const startDate = new Date('2024-01-01');

  for (let i = 0; i < seriesCount; i++) {
    const points: Point[] = [];

    for (let j = 0; j < pointsPerSeries; j++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + j * 7); // Weekly intervals

      const point: Point = {
        d: currentDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        v: Math.random() * 100 + 50 + i * 20, // Different baseline for each series
      };

      points.push(point);
    }

    const series: PrizmEchartSeries = {
      name: `Series${i + 1}`,
      points: points,
      unit: `Unit${i % 5}`,
    };

    mockSeries.push(series);
  }

  return mockSeries;
}

/**
 * Creates dataset source from PrizmEchartSeries array
 * Format: Array of objects where each object represents a data point with date and values for each series
 */
export function createDatasetSources(
  series: PrizmEchartSeries[]
): DatasetOption[] {
  return series.map(({ name, points }) => ({
    id: name,
    source: points,
  }));
}

/**
 * Creates SeriesOption array from PrizmEchartSeries array
 */
export function createSeriesOptions(
  series: PrizmEchartSeries[],
  oldSeriesSettings: SeriesOption[] = []
): SeriesOption[] {
  return series.map((s, index) => {
    // Find existing settings for this series by name
    const existingSettings = oldSeriesSettings.find(
      (setting) => setting.name === s.name
    );

    // If existing settings found, use them, ensuring required properties are set
    if (existingSettings) {
      // Create a new object with the existing settings as the base
      return {
        ...existingSettings,
        type: existingSettings.type || 'line', // Ensure type is set
        name: `${s.name}, ${s.unit}`,
      } as SeriesOption;
    }

    // Default settings for new series
    return {
      type: 'line',
      name: `${s.name}, ${s.unit}`,
      id: s.name,
      datasetId: s.name,
      yAxisId: s.unit,
      lineStyle: {
        color: getColorByIndex(index),
      },
      itemStyle: {
        color: getColorByIndex(index),
      },
      encode: {
        x: 'd',
        y: 'v',
      },
    } satisfies SeriesOption;
  });
}

export function createYAxisOption(
  series: PrizmEchartSeries[],
  oldYAxisOption: YAXisOption[] = []
): YAXisOption[] {
  const newState: YAXisOption[] = [];
  for (let item of series) {
    if (newState.some(({ id }) => id === item.unit)) {
      continue;
    }
    const existingSettings = oldYAxisOption.find(({ id }) => id === item.unit);
    if (existingSettings) {
      newState.push(existingSettings);
    }
    newState.push({
      ...ECHARTS_CONFIG_PRESETS.Y_AXIS,
      id: item.unit,
      name: item.unit,
      offset: newState.length * ECHARTS_CONFIG_PRESETS.Y_AXIS_BASIC_GAP,
    });
  }

  return newState;
}

/**
 * Generates a color from the color palette based on the given index
 * Uses modulo to cycle through the palette if index exceeds palette length
 */
export function getColorByIndex(index: number): string {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

/**
 * Generates a random color from the color palette
 */
export function getRandomColor(): string {
  const randomIndex = Math.floor(Math.random() * COLOR_PALETTE.length);
  return COLOR_PALETTE[randomIndex];
}

/**
 * Generates a unique color for large indices by combining existing palette colors
 * This ensures unique colors even for very large datasets
 */
export function getUniqueColorByIndex(index: number): string {
  // For indices within palette range, use direct palette colors
  if (index < COLOR_PALETTE.length) {
    return COLOR_PALETTE[index];
  }

  // For larger indices, combine existing palette colors
  const cycleIndex = Math.floor(index / COLOR_PALETTE.length);
  const baseColorIndex = index % COLOR_PALETTE.length;
  const blendColorIndex =
    (baseColorIndex + cycleIndex + 1) % COLOR_PALETTE.length;

  const baseColor = COLOR_PALETTE[baseColorIndex];
  const blendColor = COLOR_PALETTE[blendColorIndex];

  // Blend the two colors based on cycle index
  const blendRatio = ((cycleIndex % 3) + 1) / 4; // 0.25, 0.5, 0.75 ratios

  return blendColors(baseColor, blendColor, blendRatio);
}

/**
 * Blends two hex colors together
 */
function blendColors(color1: string, color2: string, ratio: number): string {
  // Convert hex to RGB
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');

  const r1 = parseInt(hex1.substr(0, 2), 16);
  const g1 = parseInt(hex1.substr(2, 2), 16);
  const b1 = parseInt(hex1.substr(4, 2), 16);

  const r2 = parseInt(hex2.substr(0, 2), 16);
  const g2 = parseInt(hex2.substr(2, 2), 16);
  const b2 = parseInt(hex2.substr(4, 2), 16);

  // Blend RGB values
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);

  // Convert back to hex
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, c)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
