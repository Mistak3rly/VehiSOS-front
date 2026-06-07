import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let mensajeLegible = 'Ocurrió un error inesperado. Por favor, intenta más tarde.';

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente o de red
        mensajeLegible = 'Error de conexión. Verifica tu internet.';
      } else {
        // El backend devolvió un código de error (4xx, 5xx)
        switch (error.status) {
          case 0:
            mensajeLegible = 'No hay conexión con el servidor. Verifica que el backend esté ejecutándose.';
            break;
          case 400:
            mensajeLegible = 'Datos incorrectos. Revisa el formulario antes de enviar.';
            break;
          case 401:
            // Mensaje claro para errores de logeo / token inválido
            mensajeLegible = 'Credenciales incorrectas o tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
            break;
          case 403:
            mensajeLegible = error.error?.detail || 'No tienes permiso para realizar esta acción o tu cuenta está inactiva.';
            break;
          case 404:
            mensajeLegible = 'El recurso o dato que buscas no existe.';
            break;
          case 409:
            // Conflict (ej. correo ya registrado)
            mensajeLegible = error.error?.detail || 'Este registro ya existe (por ejemplo, el correo ya está en uso).';
            break;
          case 422:
            mensajeLegible = 'Faltan datos obligatorios o el formato es inválido.';
            break;
          case 500:
            mensajeLegible = 'Error interno del servidor. Por favor avisa al soporte técnico.';
            break;
          default:
            if (error.error && error.error.detail) {
              mensajeLegible = error.error.detail;
            }
            break;
        }
      }

      // Si el backend envía un mensaje específico en detail (que no sea 401 genérico), 
      // y queremos darle prioridad, podemos sobreescribirlo aquí, 
      // pero el switch de arriba ya da buenos mensajes por defecto.
      
      // Inyectamos nuestro mensaje legible dentro del objeto de error para que 
      // los componentes lo puedan leer fácilmente.
      const errorModificado = new HttpErrorResponse({
        error: { detail: mensajeLegible, originalError: error.error },
        headers: error.headers,
        status: error.status,
        statusText: error.statusText,
        url: error.url || undefined
      });

      return throwError(() => errorModificado);
    })
  );
};
