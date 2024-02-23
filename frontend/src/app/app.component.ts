import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { LoginSignupComponent } from './components/login-signup/login-signup.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginSignupComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        if (!this.authService.hasSession() && router.url != "/register" && !router.url.startsWith("/reset_password")) {
          this.router.navigate(['/login']);
        } else if (router.url == '/' || router.url == '/login') {
          this.router.navigate(['/todos']);
        }
      });
  }
}
