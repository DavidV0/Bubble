import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextareaContainerComponent } from './textarea-container.component';

describe('TextareaContainerComponent', () => {
  let component: TextareaContainerComponent;
  let fixture: ComponentFixture<TextareaContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaContainerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TextareaContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
