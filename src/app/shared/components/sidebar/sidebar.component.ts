import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { UserService } from '../../services/user.service';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

interface Menu {
  label: string;
  icon?: string;
  link?: string;
  children?: Menu[];
  open?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  user: any;
  menus: Menu[] = [];
  currentUrl: string = '';

  constructor(
    public apiService: ApiService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
    // Subscribe to user changes
    this.userService.currentUser$.subscribe(user => {
      this.user = user;
      if (this.user) this.setMenus(this.user.role_id);
    });

    // Track current route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.urlAfterRedirects;

      // Expand active parent if child route is active
      this.expandActiveParents();

      // Close menus that are not active
      this.menus.forEach(menu => {
        if (!this.isChildActive(menu) && !this.isActive(menu.link)) {
          menu.open = false;
        }
      });
    });
  }

  setMenus(roleId: number) {
    const allMenus: Record<number, Menu[]> = {
      1: [
        {
          label: 'CMS Management', icon: 'fa fa-laptop', children: [
            { label: 'Home Page', link: '/home' },
            { label: 'About Page', link: '/about' },
            { label: 'Service Page', link: '/service' },
            { label: 'Product Page', link: '/product' },
            { label: 'Our Team Page', link: '/ourteam' },
            { label: 'Testimonial Page', link: '/testimonial' },
          ], open: false
        },
        { label: 'User List', icon: 'fas fa-users', link: '/user' },
        { label: 'Employee List', icon: 'fas fa-user-secret', link: '/employee' },
        { label: 'Contact Us', icon: 'fas fa-headset', link: '/contactus' },
        { label: 'Registered Students', icon: 'fas fa-user-graduate', link: '/students' },
        { label: 'Blogs', icon: 'fas fa-blog', link: '/blogs' },
      ],
      2: [
        {
          label: 'CMS Management', icon: 'fa fa-laptop', children: [
            { label: 'Home Page', link: '/home' },
            { label: 'About Page', link: '/about' }
          ], open: false
        },
        {
          label: 'Blogs', icon: 'far fa-file-alt', children: [
            { label: 'Features', link: '/features' },
            { label: 'Our Team', link: '/team' }
          ], open: false
        }
      ],
      3: [
        {
          label: 'CMS Management', icon: 'fa fa-laptop', children: [
            { label: 'Home Page', link: '/home' }
          ], open: false
        }
      ]
    };

    this.menus = allMenus[roleId] || [];
  }

  toggleDropdown(menu: Menu) {
    // Close other menus
    this.menus.forEach(m => {
      if (m !== menu) m.open = false;
    });

    // Toggle clicked menu
    menu.open = !menu.open;
  }

  isActive(link?: string): boolean {
    return link ? this.currentUrl === link : false;
  }

  isChildActive(menu: Menu): boolean {
    if (!menu.children) return false;
    return menu.children.some(child => this.isActive(child.link));
  }

  expandActiveParents() {
    this.menus.forEach(menu => {
      if (this.isChildActive(menu)) {
        menu.open = true;
      }
    });
  }
}
