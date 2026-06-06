import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AdminService } from '../../../../core/services/admin.service';
import { TenantThemeService } from '../../../../core/services/tenant-theme.service';
import { TenantRead } from '../../../../core/models/api.models';

@Component({
  selector: 'app-vista-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './vista-login.html',
  styleUrl: './vista-login.scss',
})
export class VistaLogin implements OnInit {
  loginForm: FormGroup;
  errorMessage = signal('');
  isLoading = signal(false);
  isAdminLogin = false;
  isPanelOpen = signal(false);
  tenants = signal<TenantRead[]>([]);
  selectedTenant = signal<TenantRead | null>(null);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private adminService: AdminService,
    private themeService: TenantThemeService,
  ) {
    this.loginForm = this.fb.group({
      identificador: ['', [Validators.required]],
      password: ['', [Validators.required]],
      remember: [false]
    });

    this.isAdminLogin = this.route.snapshot.data['adminLogin'] === true || this.route.snapshot.routeConfig?.path === 'admin/login';
  }

  ngOnInit(): void {
    const raw = localStorage.getItem('pending_tenant');
    if (raw) {
      try {
        const t = JSON.parse(raw) as TenantRead;
        this.selectedTenant.set(t);
        this.themeService.applyTenantTheme(t);
      } catch { /* ignore */ }
    }
    this.adminService.listTenantsPublic().subscribe({
      next: (list) => this.tenants.set(list),
      error: () => this.tenants.set([]),
    });
  }

  togglePanel(): void {
    this.isPanelOpen.update(v => !v);
  }

  selectTenantFromPanel(tenant: TenantRead): void {
    this.selectedTenant.set(tenant);
    this.themeService.applyTenantTheme(tenant);
    localStorage.setItem('pending_tenant', JSON.stringify(tenant));
    this.isPanelOpen.set(false);
  }

  clearTenantSelection(): void {
    this.selectedTenant.set(null);
    this.themeService.applyTenantTheme(null);
    localStorage.removeItem('pending_tenant');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  submitLogin() {
    if (this.loginForm.valid) {
      // Envía tenant_id solo si el usuario seleccionó uno explícitamente (no en admin/login)
      const tenantId = (!this.isAdminLogin && this.selectedTenant()?.id)
        ? this.selectedTenant()!.id
        : null;

      this.isLoading.set(true);
      this.errorMessage.set('');

      const payload = { ...this.loginForm.value, tenant_id: tenantId };
      this.authService.login(payload).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          localStorage.removeItem('pending_tenant');
          const roleRaw = this.authService.getUserRole() || '';
          const role = roleRaw.toLowerCase();
          
          let redirectUrl = '/dashboard';

          if (role === 'administrador' || role === 'admin') redirectUrl = '/admin/dashboard';
          else if (role === 'taller') redirectUrl = '/taller/dashboard';
          else if (role === 'tecnico') redirectUrl = '/taller/dashboard';

          if (this.isAdminLogin && (role === 'admin' || role === 'administrador')) {
            redirectUrl = '/admin/dashboard';
          }

          this.router.navigate([redirectUrl]);
        },
        error: (err) => {
          this.isLoading.set(false);
          if (err.status === 401) {
            this.errorMessage.set('Correo/documento o contraseña incorrectos.');
          } else if (err.status === 403) {
            this.errorMessage.set(err.error?.detail || 'No tienes acceso a esta organización.');
          } else if (err.status === 422) {
            this.errorMessage.set('La contraseña debe tener al menos 8 caracteres.');
          } else {
            this.errorMessage.set(err.error?.detail || 'Error al iniciar sesión. Verifica tus credenciales.');
          }
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
