import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(public authService: AuthService) {}
  canActivate(): boolean {
    if (!this.authService.isAuthenticated) {
      this.authService.router.navigateByUrl("auth");
      return false;
    }
    return true;
  }

}
