import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../shared/services/api.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss'
})
export class SigninComponent {
  email = '';
  password = '';
  // rememberMe = false;
  error = '';

  constructor(private apiService: ApiService, private router: Router, private userService: UserService) { }

  signIn() {
    this.error = '';
    this.apiService.signIn({
      signin: true,              // <-- required field
      email: this.email,
      password: this.password,
      // rememberMe: this.rememberMe
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.userService.setUser(res.user);
          this.router.navigate(['/home']);
        } else {
          this.error = res.message || 'Invalid email or password';
          setTimeout(() => this.error = '', 1000);
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Server error';
        setTimeout(() => this.error = '', 1000);
      }
    });
  }


}
