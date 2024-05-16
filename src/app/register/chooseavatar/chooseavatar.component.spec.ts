import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseavatarComponent } from './chooseavatar.component';

describe('ChooseavatarComponent', () => {
  let component: ChooseavatarComponent;
  let fixture: ComponentFixture<ChooseavatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseavatarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChooseavatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
