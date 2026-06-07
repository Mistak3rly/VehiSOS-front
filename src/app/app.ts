import { Component, signal, OnInit, effect } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './core/components/sidebar/sidebar.component';
import { AuthService } from './core/services/auth.service';
import { TenantThemeService } from './core/services/tenant-theme.service';
import { OfflineService } from './core/services/offline.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('vehisos-front');
  showSidebar = signal(false);

  private readonly AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

  constructor(
    private router: Router,
    private auth: AuthService,
    private themeService: TenantThemeService,
    readonly offlineService: OfflineService,
  ) {
    // Re-aplica el tema del tenant en TODA la app cada vez que cambia el usuario
    effect(() => {
      const user = this.auth.currentUser();
      const tenant = user?.tenant ?? this.auth.getTenant();
      this.themeService.applyTenantTheme(tenant);
    });
  }

  ngOnInit() {
    // Evaluar la ruta inicial antes del primer NavigationEnd
    const initialUrl = this.router.url;
    this.showSidebar.set(!this.isAuthRoute(initialUrl));

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.showSidebar.set(!this.isAuthRoute(url));
    });
  }

  private isAuthRoute(url: string): boolean {
    return this.AUTH_ROUTES.some(route => url.includes(route));
  }
}
