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
} from '@prizm-ui/components';
import { LineSeriesOption, SeriesOption } from 'echarts';
import { BehaviorSubject } from 'rxjs';

type LineType = 'solid' | 'dashed' | 'dotted';
type PrizmItem<T = number> = {
  id: T;
  name: string;
};
@Component({
  selector: 'prizm-popup-settings',
  standalone: true,
  imports: [
    CommonModule,
    PrizmDialogComponent,
    PrizmPanelComponent,
    PrizmCardComponent,
    PrizmButtonComponent,
    ReactiveFormsModule,
    PrizmSelectInputComponent,
    PrizmInputSelectModule,
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

  readonly stringify: PrizmSelectStringify<PrizmItem|undefined> = (item) =>
    String(item?.name ?? '-');

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
        },
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
