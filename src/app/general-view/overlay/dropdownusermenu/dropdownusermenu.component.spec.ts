import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownusermenuComponent } from './dropdownusermenu.component';

describe('DropdownusermenuComponent', () => {
  let component: DropdownusermenuComponent;
  let fixture: ComponentFixture<DropdownusermenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownusermenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DropdownusermenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
