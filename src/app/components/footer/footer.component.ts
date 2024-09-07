import { Component, Renderer2 } from '@angular/core';
import { Router,RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  constructor(private router: Router, private renderer: Renderer2){

  }

  navigateToSection(sectionId: string) {
    this.router.navigate(['/about'], { fragment: sectionId }).then(() => {
      // Espera un pequeño tiempo para asegurarse de que el componente "about" haya sido cargado
      setTimeout(() => {
        const element = this.renderer.selectRootElement(`#${sectionId}`, true);
        if (element) {
          this.renderer.listen(element, 'scrollIntoView', () => {});
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);  // Ajusta el tiempo si es necesario
    });
  }

}
