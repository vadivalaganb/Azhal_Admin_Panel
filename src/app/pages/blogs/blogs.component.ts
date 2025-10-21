import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrls: ['./blogs.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class BlogsComponent implements OnInit {

  blogForm!: FormGroup;
  blogslist: any[] = [];
  categories: any[] = [];

  showFormModal = false;
  currentImage: string | null = null;
  profileImageFile: File | null = null;
  editingId: number | null = null;
  confirmDeleteId: number | null = null;

  constructor(private fb: FormBuilder, public api: ApiService) {}

  ngOnInit(): void {
    this.blogForm = this.fb.group({
      header_name: ['', Validators.required],
      category_id: ['', Validators.required],
      short_description: [''],
      description: ['', Validators.required],
      status: [true]
    });

    this.loadBlogs();
    this.loadCategories();
  }

  loadBlogs() {
    this.api.getAllBlogs().subscribe({
      next: (response: any) => this.blogslist = response.data || response,
      error: err => console.error('Error loading blogs:', err)
    });
  }

  loadCategories() {
    this.api.getAllCategories().subscribe({
      next: (response: any) => this.categories = response.data || response,
      error: err => console.error('Error loading categories:', err)
    });
  }

  openForm(blog?: any) {
    this.showFormModal = true;
    if (blog) {
      this.editingId = blog.id;
      this.blogForm.patchValue({
        header_name: blog.header_name,
        category_id: blog.category_id,
        short_description: blog.short_description,
        description: blog.description,
        status: blog.status === '1' || blog.status === true
      });
      this.currentImage = blog.file_path;
    } else {
      this.blogForm.reset({ status: true });
      this.editingId = null;
      this.currentImage = null;
      this.profileImageFile = null;
    }
  }

  closeForm() {
    this.showFormModal = false;
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.profileImageFile = event.target.files[0];
    }
  }

  onSubmit() {
    if (this.blogForm.invalid) return;

    const formData = new FormData();
    Object.entries(this.blogForm.value).forEach(([key, val]) => formData.append(key, String(val)));
    if (this.profileImageFile) formData.append('file', this.profileImageFile);
    if (this.editingId) formData.append('id', String(this.editingId));

    this.api.createOrUpdateBlog(formData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.loadBlogs();
          this.closeForm();
        } else {
          alert(res.error || 'Error saving blog');
        }
      },
      error: err => console.error('Error saving blog:', err)
    });
  }

  openDeleteConfirm(id: number) {
    this.confirmDeleteId = id;
  }

  cancelDelete() {
    this.confirmDeleteId = null;
  }

  confirmDelete() {
    if (this.confirmDeleteId) {
      this.api.deleteBlogById(this.confirmDeleteId).subscribe({
        next: (res: any) => {
          if (res.success) this.loadBlogs();
          this.cancelDelete();
        },
        error: err => console.error('Error deleting blog:', err)
      });
    }
  }
}
