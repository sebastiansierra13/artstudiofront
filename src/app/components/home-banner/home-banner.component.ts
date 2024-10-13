import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { NgIf, NgFor, isPlatformBrowser } from '@angular/common';
import { BannersService } from '../../services/banners.service';
import { Banner } from '../../interfaces/interfaces-app';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import * as Hammer from 'hammerjs';

@Component({
  selector: 'app-home-banner',
  standalone: true,
  imports: [NgIf, NgFor, RouterModule],
  templateUrl: './home-banner.component.html',
  styleUrls: ['./home-banner.component.css']
})
export class HomeBannerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('carouselContainer') carouselContainer!: ElementRef;

  banners: Banner[] = [];
  currentSlideIndex = 0;
  private destroy$ = new Subject<void>();
  private hammer: HammerManager | null = null;

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

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initHammer();
    }
  }

  initHammer() {
    this.hammer = new Hammer.Manager(this.carouselContainer.nativeElement);

    // Configurar swipe solo en el eje horizontal
    this.hammer.add(new Hammer.Swipe({ direction: Hammer.DIRECTION_HORIZONTAL }));

    this.hammer.on('swipeleft', () => {
      this.nextSlide();
    });

    this.hammer.on('swiperight', () => {
      this.prevSlide();
    });
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
    if (this.hammer) {
      this.hammer.destroy();
    }
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
