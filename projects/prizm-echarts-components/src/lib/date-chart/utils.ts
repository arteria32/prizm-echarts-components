import { SeriesOption } from 'echarts';
import { DatasetOption } from 'echarts/types/dist/shared';
import { Point, PrizmEchartSeries } from './date-chart.component';

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
  return series.map((s) => {
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
        name: s.name, // Ensure name matches the series name
      } as SeriesOption;
    }

    // Default settings for new series
    return {
      type: 'line',
      name: s.name,
      id:s.name,
      datasetId: s.name,
      encode: {
        x: 'd',
        y: 'v',
      },
    } satisfies SeriesOption;
  });
}

