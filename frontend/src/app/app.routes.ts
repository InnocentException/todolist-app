import { Routes } from '@angular/router';
import { LoginSignupComponent } from './components/login-signup/login-signup.component';
import { TodoListsComponent } from './components/todo-lists/todo-lists.component';
import { AccountSettingsComponent } from './components/account-settings/account-settings.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { MfaComponent } from './components/mfa/mfa.component';

export const routes: Routes = [
  { path: 'login', component: LoginSignupComponent },
  { path: 'login/mfa', component: MfaComponent },
  { path: 'register', component: LoginSignupComponent },
  { path: 'todos', component: TodoListsComponent },
  { path: 'account', component: AccountSettingsComponent },
  { path: 'reset_password/:token', component: ResetPasswordComponent },
];
