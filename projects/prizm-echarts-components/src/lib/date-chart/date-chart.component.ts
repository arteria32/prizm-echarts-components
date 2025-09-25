import { Component } from '@angular/core';
// import echarts core
import * as echarts from 'echarts/core';
// import necessary echarts components
import { CommonModule } from '@angular/common';
import { EChartsOption } from 'echarts';
import { LineChart } from 'echarts/charts';
import {
  DataZoomSliderComponent,
  GridComponent,
  ToolboxComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { ECHARTS_CONFIG_PRESETS, ICONS_PATHS } from './constants';
echarts.use([
  LineChart,
  GridComponent,
  DataZoomSliderComponent,
  CanvasRenderer,
  ToolboxComponent,
]);

@Component({
  standalone: true,
  providers: [provideEchartsCore({ echarts })],
  imports: [CommonModule, NgxEchartsDirective],
  selector: 'prizm-date-chart',
  templateUrl: './date-chart.component.html',
  styleUrl: './date-chart.component.scss',
})
export class PrizmDateChartComponent {
  private chartInstance: null | echarts.ECharts = null;
  protected onChartInit(instance: echarts.ECharts) {
    this.chartInstance = instance;
  }

  //todo: remove dynamic fields from config (data)
  private exportConfig() {
    if (!this.chartInstance) return;
    const currentConfig = this.chartInstance.getOption();

    const configStr = JSON.stringify(currentConfig, null, 2); // null, 2 for pretty formatting

    const blob = new Blob([configStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'echarts-config.json';
    link.click();

    URL.revokeObjectURL(url);
  }

  protected chartOption: EChartsOption = {
    yAxis: {
      type: 'value',
    },
    xAxis: ECHARTS_CONFIG_PRESETS.X_AXIS,
    toolbox: {
      feature: {
        saveAsImage: {
          title: 'Export PNG',
          pixelRatio: 2,
        },
        myExportConfig: {
          icon: ICONS_PATHS.EXPORT_FILE,
          onclick: () => {
            this.exportConfig();
          },
        },
      },
    },
    series: [
      {
        data: [
          ['2024-04-09T00:00:00Z', 2],
          ['2025-04-09T00:00:00Z', 3],
          ['2026-04-09T00:00:00Z', 2],
          ['2027-04-09T00:00:00Z', 2],
          ['2028-04-09T00:00:00Z', 2],
        ] as const,
        type: 'line',
      },
    ],
    dataZoom: ECHARTS_CONFIG_PRESETS.SCROLL_SLIDER,
  };
}
