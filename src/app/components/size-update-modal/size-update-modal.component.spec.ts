import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SizeUpdateModalComponent } from './size-update-modal.component';

describe('SizeUpdateModalComponent', () => {
  let component: SizeUpdateModalComponent;
  let fixture: ComponentFixture<SizeUpdateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SizeUpdateModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SizeUpdateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
