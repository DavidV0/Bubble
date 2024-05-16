import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatechannelComponent } from './createchannel.component';

describe('CreatechannelComponent', () => {
  let component: CreatechannelComponent;
  let fixture: ComponentFixture<CreatechannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatechannelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreatechannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
