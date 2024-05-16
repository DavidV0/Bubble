import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistereduserprofileComponent } from './registereduserprofile.component';

describe('RegistereduserprofileComponent', () => {
  let component: RegistereduserprofileComponent;
  let fixture: ComponentFixture<RegistereduserprofileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistereduserprofileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistereduserprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
