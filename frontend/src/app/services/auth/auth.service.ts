import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Session } from '../../utils/types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private session: string;
  
  constructor(private cookieService: CookieService) {
    this.session = cookieService.get("session") ? cookieService.get("session") : "";
  }

  updateSession(session: Session) {
    if (session) {
      const token = session.token;
      const expires = session.expires;
      this.cookieService.set('session', token ? token : '', {
        path: "/",
        expires: new Date(expires)
      });
      this.session = session.token;
    }
  }

  getSession() {
    return this.session;
  }

  hasSession() {
    return this.session != "";
  }
}
