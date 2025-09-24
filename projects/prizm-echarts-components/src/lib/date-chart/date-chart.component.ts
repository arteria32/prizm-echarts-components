import { Component } from '@angular/core';
import { EChartsCoreOption } from 'echarts/core';
// import echarts core
import * as echarts from 'echarts/core';
// import necessary echarts components
import { LineChart } from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CommonModule } from '@angular/common';
echarts.use([LineChart, GridComponent, CanvasRenderer]);
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';


@Component({
  standalone:true,
    providers: [provideEchartsCore({ echarts })],
  imports: [CommonModule, NgxEchartsDirective],
  selector: 'prizm-date-chart',
  templateUrl: './date-chart.component.html',
  styleUrl: './date-chart.component.scss'
})
export class PrizmDateChartComponent {
protected chartOption: EChartsCoreOption = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
    },
  ],
};
}
