import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayaccountcreatedComponent } from './overlayaccountcreated.component';

describe('OverlayaccountcreatedComponent', () => {
  let component: OverlayaccountcreatedComponent;
  let fixture: ComponentFixture<OverlayaccountcreatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayaccountcreatedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OverlayaccountcreatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
