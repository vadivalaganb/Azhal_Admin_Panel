import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  userForm!: FormGroup;
  userlist: any[] = [];
  roles: any[] = [];
  showFormModal = false;
  editingId: number | null = null;
  // profileImageFile: File | null = null;
  // currentProfileImage: string | null = null;
  confirmDeleteId: number | null = null;

  constructor(private fb: FormBuilder, public apiService: ApiService, private userService: UserService) { }

  ngOnInit(): void {
    this.initForm();
    this.loadRoles();
    this.loadUserList();
  }

  initForm() {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.editingId ? [] : Validators.required], // Password required only on create
      role_id: ['', Validators.required],
      status: [true],
      is_email_verified: [false]
    });
  }

  loadRoles() {
    this.apiService.getRoles().subscribe(res => {
      this.roles = res.data || [];
    });
  }


  loadUserList() {
    this.apiService.getUsers().subscribe(res => {
      this.userlist = res.users || []; // ✅ matches API
    });
  }


  openForm(user?: any) {
    this.showFormModal = true;
    this.editingId = user?.id || null;
    // this.profileImageFile = null;
    // this.currentProfileImage = user?.avatar_url || null;

    this.userForm.reset({
      username: user?.username || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      password: '',
      role_id: user?.role_id || '',
      status: user ? !!user.status : true,
      is_email_verified: user ? !!user.is_email_verified : false
    });
  }

  closeForm() {
    this.showFormModal = false;
    this.editingId = null;
    this.userForm.reset();
  }

  // onFileChange(event: any) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     this.profileImageFile = file;
  //   }
  // }

  onSubmit() {
    if (this.userForm.invalid) return;

    const payload = { ...this.userForm.value };

    if (this.editingId) {
      this.apiService.updateUser(this.editingId, payload).subscribe({
        next: (res: any) => {
          // Check if API returned updated user
          if (res.success && res.updatedUser) {
            this.userService.setUser(res.updatedUser); // update sidebar
          }
          this.loadUserList();
          this.closeForm();
        },
        error: (err) => console.error(err)
      });
    } else {
      this.apiService.createUser(payload).subscribe({
        next: () => {
          this.loadUserList();
          this.closeForm();
        },
        error: (err) => console.error(err)
      });
    }
  }


  openDeleteConfirm(id: number) {
    this.confirmDeleteId = id;
  }

  confirmDelete() {
    if (!this.confirmDeleteId) return;
    this.apiService.deleteUser(this.confirmDeleteId).subscribe({
      next: () => {
        this.loadUserList();
        this.confirmDeleteId = null;
      },
      error: (err) => console.error(err)
    });
  }

  cancelDelete() {
    this.confirmDeleteId = null;
  }
}
