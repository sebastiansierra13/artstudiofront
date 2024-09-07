import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-blog-card',
  standalone: true,
  templateUrl: './blog-card.component.html',
  styleUrls: ['./blog-card.component.css'],
  imports: [CommonModule, RouterModule, CarouselModule]
})
export class BlogCardComponent implements OnInit {
  blogs: any[] = [];
  responsiveOptions: any[];

  constructor(private blogService: BlogService) {
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 2,
        numScroll: 2
      },
      {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 2
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
      }
    ];
  }

  ngOnInit(): void {
    this.blogService.getBlogs().subscribe(data => {
      this.blogs = data;
    });
  }
}