import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionCategoriesComponent } from './accordion-categories.component';

describe('AccordionCategoriesComponent', () => {
  let component: AccordionCategoriesComponent;
  let fixture: ComponentFixture<AccordionCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionCategoriesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccordionCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
