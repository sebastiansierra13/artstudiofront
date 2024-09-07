import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishlistPanelComponent } from './wishlist-panel.component';

describe('WishlistPanelComponent', () => {
  let component: WishlistPanelComponent;
  let fixture: ComponentFixture<WishlistPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistPanelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WishlistPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
