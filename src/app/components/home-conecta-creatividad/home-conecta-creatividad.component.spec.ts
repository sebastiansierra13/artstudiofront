import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeConectaCreatividadComponent } from './home-conecta-creatividad.component';

describe('HomeConectaCreatividadComponent', () => {
  let component: HomeConectaCreatividadComponent;
  let fixture: ComponentFixture<HomeConectaCreatividadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeConectaCreatividadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomeConectaCreatividadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
