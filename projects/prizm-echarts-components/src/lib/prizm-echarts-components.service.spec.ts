import { TestBed } from '@angular/core/testing';

import { PrizmEchartsComponentsService } from './prizm-echarts-components.service';

describe('PrizmEchartsComponentsService', () => {
  let service: PrizmEchartsComponentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrizmEchartsComponentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
