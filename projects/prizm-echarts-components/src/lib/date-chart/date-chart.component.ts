import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
// import echarts core
import * as echarts from 'echarts/core';
// import necessary echarts components
import { CommonModule } from '@angular/common';
import { EChartsOption, SeriesOption } from 'echarts';
import { LineChart } from 'echarts/charts';
import {
  DataZoomSliderComponent,
  GridComponent,
  ToolboxComponent,
  DatasetComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { ECHARTS_CONFIG_PRESETS, ICONS_PATHS } from './constants';
import { createDatasetSources, createSeriesOptions } from './utils';

echarts.use([
  LineChart,
  GridComponent,
  DataZoomSliderComponent,
  CanvasRenderer,
  ToolboxComponent,
  DatasetComponent,
]);

type DateString = string;
export type Point = {
  d: DateString;
  v: number;
};
export type PrizmEchartSeries = {
  name: string;
  points: Point[];
};

@Component({
  standalone: true,
  providers: [provideEchartsCore({ echarts })],
  imports: [CommonModule, NgxEchartsDirective],
  selector: 'prizm-date-chart',
  templateUrl: './date-chart.component.html',
  styleUrl: './date-chart.component.scss',
})
export class PrizmDateChartComponent implements OnChanges, OnInit {
  @Input() series: PrizmEchartSeries[] = [];

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  private chartInstance: null | echarts.ECharts = null;
  protected onChartInit(instance: echarts.ECharts) {
    console.log('onChartInit', instance);
    this.chartInstance = instance;
    setTimeout(() => {
      this.onChangeSeries(this.series);
    });
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

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  protected async importFile(e: Event) {
    const target = e.target as HTMLInputElement;
    const [configFile] = target.files as FileList;
    if (!configFile) {
      console.warn('Empty file');
    }

    console.log('importFile', configFile);
    try {
      const config = await this.readFileAsText(configFile).then((res) =>
        JSON.parse(res)
      );
      this.chartInstance?.setOption(config);
    } catch (error) {
      console.warn('invalid file', error);
    }
  }
  protected chartOption: EChartsOption = {
    yAxis: ECHARTS_CONFIG_PRESETS.Y_AXIS,
    xAxis: ECHARTS_CONFIG_PRESETS.X_AXIS,
    toolbox: {
      feature: {
        myExportConfig: {
          icon: ICONS_PATHS.EXPORT_FILE,
          title: 'Export Chart Settings',
          onclick: () => {
            this.exportConfig();
          },
        },
        myImportConfig: {
          icon: ICONS_PATHS.IMPORT_FILE,
          title: 'Import Chart Settings',
          onclick: () => {
            this.fileInputRef.nativeElement.click();
          },
        },
      },
    },
    series: [],
    dataZoom: ECHARTS_CONFIG_PRESETS.SCROLL_SLIDER,
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['series']) {
      this.onChangeSeries(changes['series'].currentValue);
    }
  }
  ngOnInit() {
    this.onChangeSeries(this.series);
  }
  onChangeSeries(newInputSeries: PrizmEchartSeries[]) {
    console.log('onChangeSeries', newInputSeries);
    if (!this.chartInstance) {
      console.warn("chart isn't initialized");
      return;
    }

    // Create dataset from series data
    const dataset = createDatasetSources(newInputSeries);

    // Create or update series configurations
    const series: SeriesOption[] = createSeriesOptions(newInputSeries);

    const resultSeries = {
      ...this.chartInstance.getOption(),
      dataset,
      series,
    };
    this.chartInstance.setOption(resultSeries);
  }
}
