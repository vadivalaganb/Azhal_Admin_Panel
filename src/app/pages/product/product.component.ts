import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, CommonModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  productForm!: FormGroup;
  productContents: any[] = [];
  showFormModal = false;
  editingId: number | null = null;
  confirmDeleteId: number | null = null;

  constructor(private fb: FormBuilder, private api: ApiService) { }

  ngOnInit(): void {
    this.initForm();
    this.loadProductContents();
  }

  initForm(): void {
    this.productForm = this.fb.group({
      header_name: ['', Validators.required],
      description: ['', Validators.required],
      icon: [''],
      status: [true]
    });
  }

  openForm(item?: any): void {
    if (item) {
      this.editingId = item.id || null;
      this.productForm.patchValue({
        header_name: item.header_name,
        description: item.description,
        icon: item.icon,
        status: item.status === 1
      });
    } else {
      this.editingId = null;
      this.productForm.reset({
        header_name: '',
        description: '',
        icon: '',
        status: true
      });
    }
    this.showFormModal = true;
  }

  closeForm(): void {
    this.showFormModal = false;
    this.editingId = null;
  }

  loadProductContents(): void {
    this.api.getProducts().subscribe({
      next: (res: any[]) => (this.productContents = res || []),
      error: (err) => console.error('Error loading product contents', err)
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;

    const payload: any = {
      ...this.productForm.value,
      status: this.productForm.value.status ? 1 : 0
    };

    if (this.editingId) {
      payload.id = this.editingId;
      payload._method = 'PUT'; // backend expects this for update
    }

    this.api.saveProduct(payload).subscribe({
      next: () => {
        this.closeForm();
        this.loadProductContents();
      },
      error: (err) => console.error('Error saving product content', err)
    });
  }

  openDeleteConfirm(id: number): void {
    this.confirmDeleteId = id;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  confirmDelete(): void {
    if (!this.confirmDeleteId) return;

    this.api.deleteProduct(this.confirmDeleteId).subscribe({
      next: () => {
        this.confirmDeleteId = null;
        this.loadProductContents();
      },
      error: (err) => console.error('Error deleting product content', err)
    });
  }
}
