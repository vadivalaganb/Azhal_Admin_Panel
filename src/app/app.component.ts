import { Component, HostListener } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NgClass, NgIf } from '@angular/common';
import { TopbarComponent } from "./shared/components/topbar/topbar.component";
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, NgIf, TopbarComponent, SidebarComponent, NgClass],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  loading = false;
  showBackToTop = false;
  showNavbarFooter = true;
  sidebarOpen = false; // Add sidebar state

  constructor(private router: Router) {
    // Initialize sidebar state based on screen size
    this.initializeSidebarState();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showBackToTop = window.scrollY > 100;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // Auto-close sidebar on mobile when resizing
    if (event.target.innerWidth <= 768) {
      this.sidebarOpen = false;
    }
  }

  private initializeSidebarState() {
    // Default sidebar state based on screen size
    this.sidebarOpen = window.innerWidth > 768;
  }

  backToTop(event: Event) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Handle sidebar toggle from topbar
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    console.log('Sidebar toggled:', this.sidebarOpen);
  }

  // Close sidebar (useful for mobile overlay)
  closeSidebar() {
    this.sidebarOpen = false;
  }

  onActivate(event: any) {
    // Get current route path
    const url = this.router.url;
    // Hide navbar and footer for / (signin) and /signup
    this.showNavbarFooter = !(url === '/' || url === '/signup');
    console.log('Activated component:', url, 'showNavbarFooter:', this.showNavbarFooter);
  }
}
