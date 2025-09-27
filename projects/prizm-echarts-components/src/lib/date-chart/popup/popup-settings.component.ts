import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  PrizmButtonComponent,
  PrizmDialogComponent,
  PrizmDialogService,
} from '@prizm-ui/components';
import { SeriesOption } from 'echarts';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'prizm-popup-settings',
  standalone: true,
  imports: [
    CommonModule,
    PrizmDialogComponent,
    PrizmButtonComponent,
    ReactiveFormsModule,
  ],
  providers: [provideAnimations()],
  templateUrl: './popup-settings.component.html',
  styleUrl: './popup-settings.component.scss',
})
export class PopupSettingsComponent implements OnInit, OnChanges {
  @ViewChild('dialogContent') dialogContent!: TemplateRef<any>;
  @ViewChild('footerTemp') footerTemp!: TemplateRef<any>;

  @Input() isVisible: boolean | null = false;
  seriesSettings$ = new BehaviorSubject<SeriesOption[]>([]);
  @Input() set seriesSettings(value: SeriesOption[]) {
    this.seriesSettings$.next(value);
  }

  @Input() onCloseCallback: (() => void) | null = null;

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly dialogService = inject(PrizmDialogService);
  private readonly formBuilder = inject(FormBuilder);
  formGroup: FormGroup = this.formBuilder.group({});

  onSubmit(): void {
    if (this.formGroup.valid) {
      const seriesFormArray = this.formGroup.get('series');
      const seriesValues = seriesFormArray?.value || [];
      
      const currentSeries = this.seriesSettings$.value;
      const updatedSeries = currentSeries.map((series, index) => {
        return {
          ...series,
          name: seriesValues[index]?.name || series.name
        };
      });
      
      this.seriesSettings$.next(updatedSeries);
      console.log('Series settings updated:', updatedSeries);
    }
  }

  ngOnInit() {
    // If isVisible is true when the component initializes, show the sidebar
    if (this.isVisible) {
      this.showSidebar();
    }
    this.seriesSettings$
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((value) => {
        // Create form controls for each series
        const seriesGroup = this.formBuilder.group(
          value.map((series) =>
            this.formBuilder.group({
              name: this.formBuilder.control(series.name),
            })
          )
        );

        this.formGroup = this.formBuilder.group({
          series: seriesGroup,
        });
        console.log('formGroup', this.formGroup, value);
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
        width: '400px',
        backdrop: false,
      })
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe();
  }

  show(): void {
    this.showSidebar();
  }

  onClose() {
    if (this.onCloseCallback) {
      this.onCloseCallback();
    } else {
      this.isVisible = false;
    }
  }
}
