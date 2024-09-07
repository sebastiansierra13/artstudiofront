import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonAdminMenuComponent } from './button-admin-menu.component';

describe('ButtonAdminMenuComponent', () => {
  let component: ButtonAdminMenuComponent;
  let fixture: ComponentFixture<ButtonAdminMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonAdminMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ButtonAdminMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
