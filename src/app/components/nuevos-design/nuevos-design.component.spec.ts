import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevosDesignComponent } from './nuevos-design.component';

describe('NuevosDesignComponent', () => {
  let component: NuevosDesignComponent;
  let fixture: ComponentFixture<NuevosDesignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevosDesignComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NuevosDesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
