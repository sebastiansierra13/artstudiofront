import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeCategoriasComponent } from './home-categorias.component';

describe('HomeCategoriasComponent', () => {
  let component: HomeCategoriasComponent;
  let fixture: ComponentFixture<HomeCategoriasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeCategoriasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomeCategoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
