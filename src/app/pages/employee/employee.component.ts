import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, CommonModule],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {
  employeeForm!: FormGroup;
  employeelist: any[] = [];
  showFormModal = false;
  editingId: number | null = null;
  confirmDeleteId: number | null = null;
  profileImageFile: File | null = null;
  loading = false;
  currentProfileImage: string | null = null;

  constructor(private fb: FormBuilder, public apiService: ApiService) { }

  ngOnInit(): void {
    this.initForm();
    this.loademployeelist();
  }

  // Initialize form with new fields
  initForm(): void {
    this.employeeForm = this.fb.group({
      name: ['', Validators.required],
      gender: ['', Validators.required],
      dob: ['', Validators.required],
      designation: ['', Validators.required],
      department: ['', Validators.required],
      joining_date: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      location: [''],
      manager: [''],
      status: [true]
    });
  }

  // Load employee list
  loademployeelist(): void {
    this.loading = true;
    this.apiService.getemployeelist().subscribe({
      next: (res: any) => {
        this.employeelist = res || [];
        this.loading = false;
      },
      error: err => {
        console.error('Error loading employee list', err);
        this.loading = false;
      }
    });
  }

  openForm(item?: any): void {
    this.showFormModal = true;
    if (item) {
      this.editingId = item.id;

      // Normalize gender to match option values
      let gender = '';
      if (item.gender) {
        const g = item.gender.trim().toLowerCase();
        if (g === 'male') gender = 'Male';
        else if (g === 'female') gender = 'Female';
        else gender = 'Other';
      }

      this.employeeForm.patchValue({
        ...item,
        gender: gender
      });

      this.currentProfileImage = item.profile_image || null;
      this.profileImageFile = null;
    } else {
      this.editingId = null;
      this.employeeForm.reset({ status: true, gender: '' });
      this.currentProfileImage = null;
      this.profileImageFile = null;
    }
  }



  closeForm(): void {
    this.showFormModal = false;
    this.editingId = null;
    this.employeeForm.reset({ status: true });
    this.profileImageFile = null;
    this.currentProfileImage = null;
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.profileImageFile = event.target.files[0];
    }
  }

  // Submit (Create / Update)
  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    Object.keys(this.employeeForm.value).forEach(key => {
      formData.append(key, this.employeeForm.value[key]);
    });

    if (this.profileImageFile) {
      formData.append('profile_image', this.profileImageFile);
    }

    if (this.editingId) {
      this.apiService.updateEmployee(this.editingId, formData).subscribe({
        next: () => {
          this.loademployeelist();
          this.closeForm();
        },
        error: err => console.error('Update failed', err)
      });
    } else {
      this.apiService.createEmployee(formData).subscribe({
        next: () => {
          this.loademployeelist();
          this.closeForm();
        },
        error: err => console.error('Create failed', err)
      });
    }
  }

  // Delete
  openDeleteConfirm(id: number): void {
    this.confirmDeleteId = id;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  confirmDelete(): void {
    if (this.confirmDeleteId !== null) {
      this.apiService.deleteEmployee(this.confirmDeleteId).subscribe({
        next: () => {
          this.loademployeelist();
          this.confirmDeleteId = null;
        },
        error: err => console.error('Delete failed', err)
      });
    }
  }
}
