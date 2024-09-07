import {Component, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeDestacadosComponent } from '../home-destacados/home-destacados.component';
import { NuevosDesignComponent } from '../nuevos-design/nuevos-design.component';
import { HomeCategoriasComponent } from '../home-categorias/home-categorias.component';
import { HomeConectaCreatividadComponent } from '../home-conecta-creatividad/home-conecta-creatividad.component';
import { FooterComponent } from '../footer/footer.component';
import { HomeBannerComponent } from '../home-banner/home-banner.component';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { FloatingButtonsComponent } from "../floating-buttons/floating-buttons.component";
import { BlogCardComponent } from "../blog-card/blog-card.component";
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

/**
 * @title Drag&Drop horizontal sorting
 */
@Component({
    selector: 'home.component',
    templateUrl: 'home.component.html',
    styleUrl: 'home.component.css',
    standalone: true,
    imports: [CommonModule, NavBarComponent, HomeBannerComponent, HomeDestacadosComponent, NuevosDesignComponent, HomeCategoriasComponent, HomeConectaCreatividadComponent, FooterComponent, FloatingButtonsComponent, BlogCardComponent,ToastModule],
    providers: [MessageService]
})
export class HomeComponent implements OnInit, OnDestroy {
    private notificationSubscription: Subscription | undefined;

    constructor(
        private notificationService: NotificationService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.notificationSubscription = this.notificationService.notificationMessage$.subscribe(
            message => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Notificación',
                    detail: message,
                    life: 3000,
                    styleClass: 'custom-toast'
                });
            }
        );
    }

    ngOnDestroy() {
        if (this.notificationSubscription) {
            this.notificationSubscription.unsubscribe();
        }
    }
}