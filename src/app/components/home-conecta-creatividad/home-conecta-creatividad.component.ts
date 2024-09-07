import { Component, OnInit } from '@angular/core';
import { ImageModule } from 'primeng/image';
import { InstagramService } from '../../services/instagram.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-conecta-creatividad',
  standalone: true,
  imports: [ImageModule, CommonModule],
  templateUrl: './home-conecta-creatividad.component.html',
  styleUrls: ['./home-conecta-creatividad.component.css']
})
export class HomeConectaCreatividadComponent implements OnInit {
  instagramPosts: any[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private instagramService: InstagramService) {}

  ngOnInit() {
    this.loadInstagramPosts();
  }

  loadInstagramPosts() {
    this.isLoading = true;
    this.error = null;
    this.instagramService.getLatestPosts().subscribe(
      (posts: any[]) => {
        this.instagramPosts = posts;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al cargar posts de Instagram:', error);
        this.error = error;
        this.isLoading = false;
      }
    );
  }

}
