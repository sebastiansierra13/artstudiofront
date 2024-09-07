import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceUpdateModalComponent } from './price-update-modal.component';

describe('PriceUpdateModalComponent', () => {
  let component: PriceUpdateModalComponent;
  let fixture: ComponentFixture<PriceUpdateModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceUpdateModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PriceUpdateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
