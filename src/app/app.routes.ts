import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SigninComponent } from './pages/signin/signin.component';
import { SignupComponent } from './pages/signup/signup.component';
import { AboutComponent } from './pages/about/about.component';

export const routes: Routes = [
  { path: '', component: SigninComponent },       // Login
  { path: 'signup', component: SignupComponent }, // Signup
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
];
