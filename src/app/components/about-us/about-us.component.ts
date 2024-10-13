import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SplitterModule } from 'primeng/splitter';
import { DividerModule } from 'primeng/divider';
import { MatDividerModule } from '@angular/material/divider';
import { FloatingButtonsComponent } from "../floating-buttons/floating-buttons.component";
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { FooterComponent } from "../footer/footer.component";
import { TextService } from '../../services/text.service';
import { Router, RouterModule } from '@angular/router';
@Component({
    selector: 'app-about-us',
    standalone: true,
    templateUrl: './about-us.component.html',
    styleUrls: ['./about-us.component.css'],
    imports: [ButtonModule, SplitterModule,RouterModule, DividerModule, MatDividerModule, FloatingButtonsComponent, NavBarComponent, FooterComponent]
})

export class AboutUsComponent implements OnInit {
  aboutUsText: string = '';
  termsText: string = '';
  shippingPoliciesText: string = '';
  returnPoliciesText: string = '';

  constructor(private router: Router,private textService: TextService) {}

  ngOnInit() {
    this.loadTexts();
  }

  loadTexts() {
    this.textService.getText('aboutUs').subscribe({
      next: (text) => {
        this.aboutUsText = text;
      },
      error: (error) => console.error('Error fetching aboutUsText:', error)
    });

    this.textService.getText('terms').subscribe({
      next: (text) => {
        this.termsText = text;
      },
      error: (error) => console.error('Error fetching termsText:', error)
    });

    this.textService.getText('shippingPolicies').subscribe({
      next: (text) => {
        this.shippingPoliciesText = text;
      },
      error: (error) => console.error('Error fetching shippingPoliciesText:', error)
    });

    this.textService.getText('returnPolicies').subscribe({
      next: (text) => {
        this.returnPoliciesText = text;
      },
      error: (error) => console.error('Error fetching returnPoliciesText:', error)
    });
  }
}
