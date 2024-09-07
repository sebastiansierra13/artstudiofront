import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeDestacadosComponent } from './home-destacados.component';

describe('HomeDestacadosComponent', () => {
  let component: HomeDestacadosComponent;
  let fixture: ComponentFixture<HomeDestacadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeDestacadosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomeDestacadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
