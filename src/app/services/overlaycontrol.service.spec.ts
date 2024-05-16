import { TestBed } from '@angular/core/testing';

import { OverlaycontrolService } from './overlaycontrol.service';

describe('OverlaycontrolService', () => {
  let service: OverlaycontrolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OverlaycontrolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
