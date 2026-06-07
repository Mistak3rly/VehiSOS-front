import { HttpInterceptorFn } from '@angular/common/http';

const PUBLIC_URLS = ['/usuarios/login', '/usuarios/register', '/tenants/public'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isPublic = PUBLIC_URLS.some(path => req.url.includes(path));
  if (isPublic) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  if (token) {
    const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    return next(cloned);
  }

  return next(req);
};
