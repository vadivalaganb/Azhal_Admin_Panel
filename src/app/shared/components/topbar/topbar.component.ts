import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit {
  user: any;
  @Output() toggleSidebarEvent = new EventEmitter<void>();

  constructor(
    public apiService: ApiService,
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
    this.userService.currentUser$.subscribe(u => {
      this.user = u;
    });
  }

  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }

  logout() {
    this.userService.clearUser();
    this.router.navigate(['/']);
  }
}
