import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private userSource = new BehaviorSubject<any>(null);
  currentUser$ = this.userSource.asObservable();

  constructor() {
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.userSource.next(JSON.parse(user));
    }
  }

  setUser(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.userSource.next(user);
  }

  clearUser() {
    localStorage.removeItem('currentUser');
    this.userSource.next(null);
  }
}
