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

    this.userForm.reset({
      username: user?.username || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      password: '',   // keep empty
      role_id: user?.role_id || '',
      status: user ? !!user.status : true,
      is_email_verified: user ? !!user.is_email_verified : false
    });

    if (this.editingId) {
      // Disable email when editing
      this.userForm.get('email')?.disable();
      // Make password optional
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      this.userForm.get('email')?.enable();
      this.userForm.get('password')?.setValidators([Validators.required]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
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

  const payload: any = { ...this.userForm.value };

  if (this.editingId) {
    if (!payload.password) {
      delete payload.password; // don’t send empty password
    }
    this.apiService.updateUser(this.editingId, payload).subscribe({
      next: () => {
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
