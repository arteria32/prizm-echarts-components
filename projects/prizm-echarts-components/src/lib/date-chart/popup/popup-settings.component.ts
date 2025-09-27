import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { EChartsOption, SeriesOption } from 'echarts';

@Component({
  selector: 'prizm-popup-settings',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './popup-settings.component.html',
  styleUrl: './popup-settings.component.scss',
})
export class PopupSettingsComponent {
  @Input() isVisible: boolean | null = false;

  @Input() seriesSettings: SeriesOption[] | null = null;
  @Input() onCloseCallback: (() => void) | null = null;


  onClose() {
    if (this.onCloseCallback) {
      this.onCloseCallback();
    }else{
      this.isVisible = false;
    }
  }
}
