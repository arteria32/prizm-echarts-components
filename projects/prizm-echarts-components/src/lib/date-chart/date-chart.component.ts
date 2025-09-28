import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
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
  DatasetComponent,
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { ECHARTS_CONFIG_PRESETS, ICONS_PATHS } from './constants';
import { PopupSettingsComponent } from './popup/popup-settings.component';
import { createDatasetSources, createSeriesOptions } from './utils';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

echarts.use([
  LineChart,
  GridComponent,
  DataZoomSliderComponent,
  CanvasRenderer,
  ToolboxComponent,
  DatasetComponent,
  DataZoomInsideComponent,
  TooltipComponent,
  LegendComponent
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
  imports: [CommonModule, NgxEchartsDirective, PopupSettingsComponent],
  selector: 'prizm-date-chart',
  templateUrl: './date-chart.component.html',
  styleUrl: './date-chart.component.scss',
})
export class PrizmDateChartComponent implements OnChanges, OnInit {
  @Input() series: PrizmEchartSeries[] = [];

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild(PopupSettingsComponent) popupComponent!: PopupSettingsComponent;
  private chartInstance: null | echarts.ECharts = null;
  protected mergeOptions$ = new Subject<EChartsOption>();
  private cdr = inject(ChangeDetectorRef);

  protected isSettingsVisible$ = new BehaviorSubject(false);

  protected seriesSettings$ = new BehaviorSubject<SeriesOption[] | null>(null);
  ngOnInit() {
    this.onChangeSeries(this.series);
  }

  protected showPopup() {
    if (!this.chartInstance) {
      console.warn("chart isn't initialized");
      return;
    }
    const currentState = this.chartInstance.getOption() as EChartsOption;
    this.isSettingsVisible$.next(true);

    this.seriesSettings$.next(
      Array.isArray(currentState.series) ? currentState.series : null
    );
    this.cdr.detectChanges();
  }

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
    legend: ECHARTS_CONFIG_PRESETS.LEGEND,
    grid: ECHARTS_CONFIG_PRESETS.GRID,

    toolbox: {
      feature: {
        mySettingsPopup: {
          icon: ICONS_PATHS.SETTINGS,
          title: 'Settings',
          onclick: () => {
            this.showPopup();
          },
        },
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
    dataZoom: ECHARTS_CONFIG_PRESETS.DATA_ZOOM,
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['series']) {
      this.onChangeSeries(changes['series'].currentValue);
    }
  }
  onChangeSeries(newInputSeries: PrizmEchartSeries[]) {
    if (!this.chartInstance) {
      console.warn("chart isn't initialized");
      return;
    }
    const currentState = this.chartInstance.getOption() as EChartsOption;

    // Create dataset from series data
    const dataset = createDatasetSources(newInputSeries);

    // Create or update series configurations
    const series: SeriesOption[] = createSeriesOptions(
      newInputSeries,
      Array.isArray(currentState.series)
        ? currentState.series
        : ([currentState.series].filter(Boolean) as SeriesOption[])
    );

    this.mergeOptions$.next({ dataset, series });
  }
  onChangesSubmit(series: SeriesOption[]) {
    this.pushOptionChanges({
      series,
    });
  }
  private pushOptionChanges(newState: EChartsOption) {
    this.mergeOptions$.next(newState);
  }
}
