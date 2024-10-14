import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { CommonModule } from '@angular/common';
import { FloatingButtonsComponent } from "../floating-buttons/floating-buttons.component";
import { FooterComponent } from "../footer/footer.component";
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { RouterModule } from '@angular/router'; // Asegúrate de tener esta importación

@Component({
    selector: 'app-blog-detail',
    standalone: true,
    templateUrl: './blog-detail.component.html',
    styleUrls: ['./blog-detail.component.css'],
    imports: [CommonModule, NavBarComponent, FloatingButtonsComponent, FooterComponent, RouterModule]
})
export class BlogDetailComponent implements OnInit {
  blog: any;
  recentPosts: any[] = [];

  constructor(private route: ActivatedRoute, private blogService: BlogService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadBlog(id);
      }
    });

    this.blogService.getBlogs().subscribe(data => {
      this.recentPosts = data.slice(0, 5);
    });
  }

  loadBlog(id: string) {
    this.blogService.getBlogById(id).subscribe(data => {
      this.blog = data;
    });
  }
}
