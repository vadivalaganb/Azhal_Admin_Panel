import { Component, HostListener } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  loading = false;
  showBackToTop = false;
  showNavbarFooter = true;
  constructor(private router: Router){
    
  }
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showBackToTop = window.scrollY > 100;
  }

  backToTop(event: Event) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  onActivate(event: any) {
    // Get current route path
    const url = this.router.url;
    // Hide navbar and footer for / (signin) and /signup
    this.showNavbarFooter = !(url === '/' || url === '/signup');
    console.log('Activated component:', url, 'showNavbarFooter:', this.showNavbarFooter);
  }
  // onActivate(event: any) {
  //   const hideFor = ['SigninComponent', 'SignupComponent'];
  //   this.showNavbarFooter = !hideFor.includes(event.constructor.name);
  //   console.log('Activated component:', event.constructor.name, 'showNavbarFooter:', this.showNavbarFooter);
  // }
}
