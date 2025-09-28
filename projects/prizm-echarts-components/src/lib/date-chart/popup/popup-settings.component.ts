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
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  PrizmButtonComponent,
  PrizmCardComponent,
  PrizmDialogComponent,
  PrizmDialogService,
  PrizmPanelComponent,
  PrizmSelectInputComponent,
  PrizmInputSelectModule,
  PrizmSelectStringify,
  PrizmInputNumberComponent,
  PrizmInputCommonModule,
  PrizmInputNumberModule,
} from '@prizm-ui/components';
import { LineSeriesOption, SeriesOption } from 'echarts';
import { BehaviorSubject } from 'rxjs';

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
  ],
  providers: [provideAnimations()],
  templateUrl: './popup-settings.component.html',
  styleUrl: './popup-settings.component.scss',
})
export class PopupSettingsComponent implements OnInit, OnChanges {
  @ViewChild('dialogContent') dialogContent!: TemplateRef<any>;
  @ViewChild('footerTemp') footerTemp!: TemplateRef<any>;

  @Input() isVisible: boolean | null = false;
  seriesSettings$ = new BehaviorSubject<LineSeriesOption[]>([]);
  @Input() set seriesSettings(value: LineSeriesOption[] | null) {
    if (value) {
      this.seriesSettings$.next(value);
    }
  }

  @Output() onChangesSubmit = new EventEmitter<LineSeriesOption[]>();

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
    const seriesValues = seriesFormArray?.value || [];

    const currentSeries = this.seriesSettings$.value;
    const updatedSeries = currentSeries.map((series, index) => {
      return {
        ...series,
        name: seriesValues[index]?.name || series.name,
        lineStyle: {
          ...series.lineStyle,
          type: seriesValues[index]?.lineStyleType.id,
          width: seriesValues[index]?.lineStyleWidth || series.lineStyle?.width,
        },
        symbol: seriesValues[index]?.symbolType.id || series.symbol,
      };
    });
    this.onChangesSubmit.emit(updatedSeries);
  }

  ngOnInit() {
    // If isVisible is true when the component initializes, show the sidebar
    if (this.isVisible) {
      this.showSidebar();
    }
    this.seriesSettings$
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((value) => {
        console.log('VALUEE', value);
        // Create form controls for each series
        const seriesGroup = this.formBuilder.group(
          value.map((series) =>
            this.formBuilder.group({
              name: this.formBuilder.control(series.name),
              lineStyleType: this.formBuilder.control(
                this.lineStyleOptions.find(
                  ({ id }) => id === series.lineStyle?.type
                )
              ),
              lineStyleWidth: this.formBuilder.control(series.lineStyle?.width),
              symbolType: this.formBuilder.control(
                this.symbolOptions.find(
                  ({ id }) => id === series.symbol
                )
              ),
            })
          )
        );

        this.formGroup = this.formBuilder.group({
          series: seriesGroup,
        });
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
        width: '800px',
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
