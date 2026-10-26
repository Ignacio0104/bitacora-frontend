import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) return next(req);

  const auth = inject(AuthService);
  const isAuthCall = req.url.startsWith(`${environment.apiUrl}/auth/`);

  const withToken = (token: string | null) =>
    req.clone({
      withCredentials: true,
      setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    });

  return next(withToken(auth.accessToken())).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse && err.status === 401 && !isAuthCall) {
        return from(auth.refreshAccessToken()).pipe(
          switchMap((token) => next(withToken(token))),
          catchError((e) => {
            auth.clear();
            return throwError(() => e);
          }),
        );
      }
      return throwError(() => err);
    }),
  );
};
