import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  PrizmButtonComponent,
  PrizmCardComponent,
  PrizmDialogService,
  PrizmInputCommonModule,
  PrizmInputNumberModule,
  PrizmInputSelectModule,
  PrizmPanelComponent,
  PrizmSelectInputComponent,
  PrizmSelectStringify,
  PrizmTabItem,
  PrizmTabsModule,
  PrizmToggleComponent
} from '@prizm-ui/components';
import { LegendComponentOption, LineSeriesOption } from 'echarts';
import { YAXisOption } from 'echarts/types/dist/shared';
import { BehaviorSubject, merge } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';
import { formatNumberToPercent, parsePercentToNumber } from '../utils';

type LineType = 'solid' | 'dashed' | 'dotted';
type SymbolType = 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond' | 'pin' | 'arrow' | 'emptyCircle' | 'none';
type PrizmItem<T = string> = {
  id: T;
  name: string;
};
@Component({
  selector: 'prizm-popup-settings',
  standalone: true,
  imports: [
    CommonModule,
    PrizmPanelComponent,
    PrizmCardComponent,
    PrizmButtonComponent,
    ReactiveFormsModule,
    PrizmSelectInputComponent,
    PrizmInputSelectModule,
    PrizmInputCommonModule,
    PrizmInputNumberModule,
    PrizmToggleComponent,
    PrizmTabsModule,
  ],
  providers: [provideAnimations()],
  templateUrl: './popup-settings.component.html',
  styleUrl: './popup-settings.component.scss',
})
export class PopupSettingsComponent implements OnInit, OnChanges {
  @ViewChild('dialogContent') dialogContent!: TemplateRef<any>;
  @ViewChild('footerTemp') footerTemp!: TemplateRef<any>;

  @Input() isVisible: boolean | null = false;
  
  public activeTabIndex = 0;
  public tabs: PrizmTabItem[] = [
    {
      title: 'Серии',
    },
    {
      title: 'Оси Y',
    },
    {
      title: 'Легенда',
    },
  ];
  seriesSettings$ = new BehaviorSubject<LineSeriesOption[]>([]);
  @Input() set seriesSettings(value: LineSeriesOption[] | null) {
    if (value) {
      this.seriesSettings$.next(value);
    }
  }

  legendSettings$ = new BehaviorSubject<LegendComponentOption>({});
  @Input() set legendSettings(value: LegendComponentOption) {
    if (value) {
      this.legendSettings$.next(value);
    }
  }

  yAxisSettings$ = new BehaviorSubject<YAXisOption[]|null>(null);
  @Input() set yAxisSettings(value: YAXisOption[]|null) {
    if (value) {
      this.yAxisSettings$.next(value);
      console.log("yAxisSettings$",this.yAxisSettings$)
    }
  }

  chartSettings$ = merge(
    this.seriesSettings$,
    this.legendSettings$,
    this.yAxisSettings$
  ).pipe(
    map(() => ({
      seriesSettings: this.seriesSettings$.value,
      legendSettings: this.legendSettings$.value,
      yAxisSettings: this.yAxisSettings$.value
    }))
  );

  @Output() onChangesSubmit = new EventEmitter<{
    series: LineSeriesOption[];
    legend: LegendComponentOption;
    yAxis: YAXisOption[];
  }>();

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly dialogService = inject(PrizmDialogService);
  private readonly formBuilder = inject(FormBuilder);
  formGroup: FormGroup = this.formBuilder.group({});
  lineStyleOptions: PrizmItem<LineType>[] = [
    { id: 'solid', name: 'Сплошная' },
    { id: 'dashed', name: 'Пунктирная' },
    { id: 'dotted', name: 'Точечная' },
  ];

  symbolOptions: PrizmItem<SymbolType>[] = [
    { id: 'circle', name: 'Круг' },
    { id: 'rect', name: 'Квадрат' },
    { id: 'roundRect', name: 'Скругленный квадрат' },
    { id: 'triangle', name: 'Треугольник' },
    { id: 'diamond', name: 'Ромб' },
    { id: 'pin', name: 'Булавка' },
    { id: 'arrow', name: 'Стрелка' },
    { id: 'emptyCircle', name: 'Пустой круг' },
    { id: 'none', name: 'Нет' },
  ];

  readonly stringify: PrizmSelectStringify<PrizmItem<LineType|SymbolType> | undefined> = (
    item
  ) => String(item?.name ?? '-');

  onSubmit(newStateFormGroup: FormGroup): void {
    if (!newStateFormGroup.valid) {
      console.warn('INVALID FORM');
      return;
    }
    const seriesFormArray = newStateFormGroup.get('series');
    const legendFormGroup = newStateFormGroup.get('legend');
    const yAxisFormGroup = newStateFormGroup.get('yAxis');
    const seriesValues = seriesFormArray?.value || [];
    const legendValues = legendFormGroup?.value || {};
    const yAxisValues = yAxisFormGroup?.value || {};

    const currentSeries = this.seriesSettings$.value;
    const updatedSeries = currentSeries.map((series, index) => {
      return {
        ...series,
        name: seriesValues[index]?.name || series.name,
        lineStyle: {
          ...series.lineStyle,
          type: seriesValues[index]?.lineStyleType.id,
          width: seriesValues[index]?.lineStyleWidth || series.lineStyle?.width,
          color: seriesValues[index]?.lineStyleColor || series.lineStyle?.color,
        },
        itemStyle: {
          ...series.itemStyle,
          color: seriesValues[index]?.lineStyleColor || series.itemStyle?.color,
        },
        symbol: seriesValues[index]?.symbolType.id || series.symbol,
      };
    });

    // Update legend settings
    const currentLegend = this.legendSettings$.value;
    const updatedLegend = {
      ...currentLegend,
      show: legendValues.show,
    };

    // Update yAxis settings
    const currentYAxis = this.yAxisSettings$.value;
    const updatedYAxis = (currentYAxis || []).map((yAxis, index) => {
      const yAxisFormValues = yAxisValues[index] || {};
      return {
        ...yAxis,
        boundaryGap: [
          formatNumberToPercent(yAxisFormValues.boundaryGapStart || 5),
          formatNumberToPercent(yAxisFormValues.boundaryGapEnd || 5)
        ] as [string, string],
      } as typeof yAxis;
    });

    this.onChangesSubmit.emit({
      series: updatedSeries,
      legend: updatedLegend,
      yAxis: updatedYAxis
    });
  }

  ngOnInit() {
    // If isVisible is true when the component initializes, show the sidebar
    if (this.isVisible) {
      this.showSidebar();
    }
    this.chartSettings$
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe(({seriesSettings, legendSettings, yAxisSettings}) => {
        // Create form controls for each series
        const seriesGroup = this.formBuilder.group(
          seriesSettings.map((series) =>
            this.formBuilder.group({
              name: this.formBuilder.control(series.name),
              lineStyleType: this.formBuilder.control(
                this.lineStyleOptions.find(
                  ({ id }) => id === series.lineStyle?.type
                )
              ),
              lineStyleWidth: this.formBuilder.control(series.lineStyle?.width),
              lineStyleColor: this.formBuilder.control(series.lineStyle?.color),
              symbolType: this.formBuilder.control(
                this.symbolOptions.find(
                  ({ id }) => id === series.symbol
                )
              ),
            })
          )
        );

        // Create form controls for each yAxis
        const yAxisGroup = this.formBuilder.group(
          (yAxisSettings || []).map((yAxis) =>
            this.formBuilder.group({
              boundaryGapStart: this.formBuilder.control(
                Array.isArray(yAxis.boundaryGap) 
                  ? parsePercentToNumber(String(yAxis.boundaryGap[0])) 
                  : 5
              ),
              boundaryGapEnd: this.formBuilder.control(
                Array.isArray(yAxis.boundaryGap) 
                  ? parsePercentToNumber(String(yAxis.boundaryGap[1])) 
                  : 5
              ),
            })
          )
        );

        this.formGroup = this.formBuilder.group({
          series: seriesGroup,
          legend: this.formBuilder.group({
            show: this.formBuilder.control(legendSettings?.show ?? true),
          }),
          yAxis: yAxisGroup,
        });
        console.log("this.formGroup = ",this.formGroup )
      });
  }

  ngOnChanges() {
    // If isVisible changes to true, show the sidebar
    if (this.isVisible) {
      this.showSidebar();
    }
  }

  showSidebar(): void {
    this.dialogService
      .open(this.dialogContent, {
        size: 'm',
        closeable: true,
        footer: this.footerTemp,
        width: '1000px',
        backdrop: false,
      })
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res) => {
        if (res) {
          this.onSubmit(res as FormGroup);
        }
      });
  }

  show(): void {
    this.showSidebar();
  }

  onClose() {
    this.isVisible = false;
  }
}
