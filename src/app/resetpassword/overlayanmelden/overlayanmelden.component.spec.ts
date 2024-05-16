import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayanmeldenComponent } from './overlayanmelden.component';

describe('OverlayanmeldenComponent', () => {
  let component: OverlayanmeldenComponent;
  let fixture: ComponentFixture<OverlayanmeldenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayanmeldenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OverlayanmeldenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
