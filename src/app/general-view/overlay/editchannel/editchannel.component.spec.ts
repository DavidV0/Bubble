import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditchannelComponent } from './editchannel.component';

describe('EditchannelComponent', () => {
  let component: EditchannelComponent;
  let fixture: ComponentFixture<EditchannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditchannelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditchannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
