import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendemailComponent } from './sendemail.component';

describe('SendemailComponent', () => {
  let component: SendemailComponent;
  let fixture: ComponentFixture<SendemailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendemailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SendemailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
