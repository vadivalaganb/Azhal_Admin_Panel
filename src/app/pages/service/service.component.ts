import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-service',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, CommonModule],
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss']
})
export class ServiceComponent implements OnInit {
  serviceForm!: FormGroup;
  serviceContents: any[] = [];
  showFormModal = false;
  editingId: number | null = null;
  confirmDeleteId: number | null = null;
  loading = false;

  constructor(private fb: FormBuilder, private apiService: ApiService) { }

  ngOnInit(): void {
    this.initForm();
    this.loadServiceContents();
  }

  // =========================
  // INIT FORM
  // =========================
  initForm(): void {
    this.serviceForm = this.fb.group({
      header_name: ['', Validators.required],
      description: ['', Validators.required],
      icon: [''],
      status: [true]
    });
  }

  // =========================
  // LOAD LIST
  // =========================
  loadServiceContents(): void {
    this.loading = true;
    this.apiService.getServiceContents().subscribe({
      next: (res: any) => {
        this.serviceContents = res || [];
        this.loading = false;
      },
      error: err => {
        console.error('Error loading service contents', err);
        this.loading = false;
      }
    });
  }

  // =========================
  // OPEN / CLOSE FORM
  // =========================
  openForm(item?: any): void {
    this.showFormModal = true;
    if (item) {
      this.editingId = item.id;
      this.serviceForm.patchValue({
        header_name: item.header_name,
        description: item.description,
        icon: item.icon,
        status: item.status == 1
      });
    } else {
      this.editingId = null;
      this.serviceForm.reset({ status: true });
    }
  }

  closeForm(): void {
    this.showFormModal = false;
    this.editingId = null;
    this.serviceForm.reset({ status: true });
  }

  // =========================
  // SUBMIT (CREATE / UPDATE)
  // =========================
  onSubmit(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.serviceForm.value,
      status: this.serviceForm.value.status ? 1 : 0
    };

    if (this.editingId) {
      // UPDATE
      this.apiService.updateServiceContent(this.editingId, payload).subscribe({
        next: () => {
          this.loadServiceContents();
          this.closeForm();
        },
        error: err => console.error('Update failed', err)
      });
    } else {
      // CREATE
      this.apiService.createServiceContent(payload).subscribe({
        next: () => {
          this.loadServiceContents();
          this.closeForm();
        },
        error: err => console.error('Create failed', err)
      });
    }
  }

  // =========================
  // DELETE
  // =========================
  openDeleteConfirm(id: number): void {
    this.confirmDeleteId = id;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  confirmDelete(): void {
    if (this.confirmDeleteId !== null) {
      this.apiService.deleteServiceContent(this.confirmDeleteId).subscribe({
        next: () => {
          this.loadServiceContents();
          this.confirmDeleteId = null;
        },
        error: err => {
          console.error('Delete failed', err);
          this.confirmDeleteId = null;
        }
      });
    }
  }
}
