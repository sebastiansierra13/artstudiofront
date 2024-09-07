import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { NgIf, NgFor, isPlatformBrowser } from '@angular/common';
import { BannersService } from '../../services/banners.service';
import { Banner } from '../../interfaces/interfaces-app';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-banner',
  standalone: true,
  imports: [NgIf, NgFor,RouterModule],
  templateUrl: './home-banner.component.html',
  styleUrls: ['./home-banner.component.css']
})
export class HomeBannerComponent implements OnInit, OnDestroy {
  banners: Banner[] = [];
  currentSlideIndex = 0;
  private destroy$ = new Subject<void>();


  constructor(
    private bannersService: BannersService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadBanners();
      this.scheduleNextSlide();
    }
  }

  scheduleNextSlide() {
    if (this.banners.length > 0) {
      new Promise((resolve) => setTimeout(resolve, 6000)).then(() => {
        this.nextSlide();
      });
    }
  }

  loadBanners() {
    this.bannersService.getBanners().pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      (banners) => {
        this.banners = banners;
      },
      (error) => {
        console.error('Error loading banners:', error);
      }
    );
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  nextSlide() {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.banners.length;
    this.scheduleNextSlide();
  }

  prevSlide() {
    this.currentSlideIndex = (this.currentSlideIndex - 1 + this.banners.length) % this.banners.length;
  }

  goToSlide(index: number) {
    this.currentSlideIndex = index;
  }
}
