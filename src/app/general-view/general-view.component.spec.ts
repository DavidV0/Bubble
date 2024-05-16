import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralViewComponent } from './general-view.component';

describe('GeneralViewComponent', () => {
  let component: GeneralViewComponent;
  let fixture: ComponentFixture<GeneralViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GeneralViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
