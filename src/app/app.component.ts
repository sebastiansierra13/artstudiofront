import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterLink, RouterOutlet,RouterModule, NavigationEnd } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'art';
  constructor(@Inject(PLATFORM_ID) private platformId: any, private router: Router) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Importamos AOS solo si estamos en el navegador
      import('aos').then(AOS => {
        AOS.init();
      });
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo(0, 0);
    });
  }
}
