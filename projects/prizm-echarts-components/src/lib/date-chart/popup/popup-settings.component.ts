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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  PrizmButtonComponent,
  PrizmDialogComponent,
  PrizmDialogService,
  PrizmInputTextComponent
} from '@prizm-ui/components';
import { SeriesOption } from 'echarts';

@Component({
  selector: 'prizm-popup-settings',
  standalone: true,
  imports: [CommonModule, PrizmDialogComponent, PrizmButtonComponent],
  providers: [provideAnimations()],
  templateUrl: './popup-settings.component.html',
  styleUrl: './popup-settings.component.scss',
})
export class PopupSettingsComponent implements OnInit, OnChanges {
  @ViewChild('dialogContent') dialogContent!: TemplateRef<any>;
  @ViewChild('footerTemp') footerTemp!: TemplateRef<any>;

  @Input() isVisible: boolean | null = false;
  @Input() seriesSettings: SeriesOption[] | null = null;
  @Input() onCloseCallback: (() => void) | null = null;

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly dialogService = inject(PrizmDialogService);

  ngOnInit() {
    // If isVisible is true when the component initializes, show the sidebar
    if (this.isVisible) {
      this.showSidebar();
    }
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
