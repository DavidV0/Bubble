import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayemailsendComponent } from './overlayemailsend.component';

describe('OverlayemailsendComponent', () => {
  let component: OverlayemailsendComponent;
  let fixture: ComponentFixture<OverlayemailsendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayemailsendComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OverlayemailsendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
