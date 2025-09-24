import { Component } from '@angular/core';
// import echarts core
import * as echarts from 'echarts/core';
// import necessary echarts components
import { CommonModule } from '@angular/common';
import { EChartsOption } from 'echarts';
import { LineChart } from 'echarts/charts';
import { DataZoomSliderComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { ECHARTS_CONFIG_PRESETS } from './constants';
echarts.use([LineChart, GridComponent,DataZoomSliderComponent, CanvasRenderer]);

@Component({
  standalone: true,
  providers: [provideEchartsCore({ echarts })],
  imports: [CommonModule, NgxEchartsDirective],
  selector: 'prizm-date-chart',
  templateUrl: './date-chart.component.html',
  styleUrl: './date-chart.component.scss',
})
export class PrizmDateChartComponent {
  protected chartOption: EChartsOption = {
    yAxis: {
      type: 'value',
    },
       xAxis: ECHARTS_CONFIG_PRESETS.X_AXIS,

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
