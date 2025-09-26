import { Component, ElementRef, ViewChild } from '@angular/core';
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

    @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

    
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

  protected async importFile(e:Event){
    const target = e.target as HTMLInputElement;
      const [configFile] = target.files as FileList;
      if(!configFile){
        console.warn('Empty file')
      }

    console.log("importFile",configFile);
    try {
      const config=await this.readFileAsText(configFile).then((res)=>JSON.parse(res))
      this.chartInstance?.setOption(config) 
    } catch (error) {
      console.warn("invalid file",error)
    }
  }
  protected chartOption: EChartsOption = {
    yAxis: {
      type: 'value',
    },
    xAxis: ECHARTS_CONFIG_PRESETS.X_AXIS,
    toolbox: {
      feature: {
        myExportConfig: {
          icon: ICONS_PATHS.EXPORT_FILE,
          title:"Export Chart Settings",
          onclick: () => {
            this.exportConfig();
          },
        },
          myImportConfig: {
          icon: ICONS_PATHS.IMPORT_FILE,
          title:"Import Chart Settings",
          onclick: () => {
            this.fileInputRef.nativeElement.click();
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
