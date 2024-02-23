import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { WebsocketService } from './services/websocket/websocket.service';
import { CookieService } from 'ngx-cookie-service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from './services/auth/auth.service';
import { HttpService } from './services/http/http.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    AppComponent,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatListModule,
  ],
  providers: [CookieService, AuthService, HttpService],
})
export class AppModule {}