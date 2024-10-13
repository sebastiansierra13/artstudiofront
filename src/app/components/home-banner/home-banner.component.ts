import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
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
  initialTouchX: number = 0;
  initialTouchY: number = 0;
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
    this.hammer.add(new Hammer.Swipe());

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

   // Detectar el inicio del touch
   @HostListener('touchstart', ['$event'])
   onTouchStart(event: TouchEvent) {
     this.initialTouchX = event.touches[0].clientX;
     this.initialTouchY = event.touches[0].clientY;
   }
 
   // Detectar el movimiento del touch
   @HostListener('touchmove', ['$event'])
   onTouchMove(event: TouchEvent) {
     const deltaX = event.touches[0].clientX - this.initialTouchX;
     const deltaY = event.touches[0].clientY - this.initialTouchY;
 
     // Si el desplazamiento en Y es mayor que en X, permitimos el scroll vertical
     if (Math.abs(deltaY) > Math.abs(deltaX)) {
       event.stopPropagation(); // Permitir el desplazamiento vertical
     }
   }
}