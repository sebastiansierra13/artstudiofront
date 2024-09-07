import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailedCartComponent } from './detailed-cart.component';

describe('DetailedCartComponent', () => {
  let component: DetailedCartComponent;
  let fixture: ComponentFixture<DetailedCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailedCartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailedCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
