import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-testimonial',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './testimonial.component.html',
  styleUrls: ['./testimonial.component.scss']
})
export class TestimonialComponent implements OnInit {

  TestimonialForm!: FormGroup;
  Testimoniallist: any[] = [];
  showFormModal = false;
  editingId: number | null = null;
  profileImageFile: File | null = null;
  currentProfileImage: string | null = null;
  confirmDeleteId: number | null = null;
  fallbackImage = 'assets/default-profile.png'; // default image if none uploaded
  previewFileUrl: string | null = null;

  constructor(private fb: FormBuilder, public apiService: ApiService) { }

  ngOnInit(): void {
    this.initForm();
    this.loadTestimoniallist();
  }

  // Initialize form
  initForm(): void {
    this.TestimonialForm = this.fb.group({
      name: ['', Validators.required],
      profession: [''],
      Message: ['', Validators.required],
      status: [true]
    });
  }

  // Load testimonial list
  loadTestimoniallist(): void {
    this.apiService.getTestimonials().subscribe(
      res => {
        // Map API response to consistent field names
        this.Testimoniallist = res.map((item: any) => ({
          id: item.id,
          name: item.name,
          profession: item.profession,
          message: item.message,
          status: item.status == '1',
          image: item.image && item.image !== '' ? item.image : null
        }));
      },
      err => console.error(err)
    );
  }

  // Open form modal
  openForm(item?: any): void {
    this.showFormModal = true;
    if (item) {
      this.editingId = item.id;
      this.currentProfileImage = item.image;
      this.TestimonialForm.patchValue({
        name: item.name,
        profession: item.profession,
        Message: item.message,
        status: item.status
      });
    } else {
      this.editingId = null;
      this.profileImageFile = null;
      this.currentProfileImage = null;
      this.TestimonialForm.reset({ status: true });
    }
  }

  closeForm(): void {
    this.showFormModal = false;
  }

  // Handle file change
  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      const file: File = event.target.files[0]; // local variable of type File
      this.profileImageFile = file;

      // Preview the uploaded image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewFileUrl = e.target.result;
      };
      reader.readAsDataURL(file); // use local 'file', guaranteed not null
    }
  }


  // Submit form
  onSubmit(): void {
    if (this.TestimonialForm.invalid) return;

    const formData = new FormData();
    formData.append('name', this.TestimonialForm.get('name')?.value);
    formData.append('profession', this.TestimonialForm.get('profession')?.value);
    formData.append('message', this.TestimonialForm.get('Message')?.value);
    formData.append('status', this.TestimonialForm.get('status')?.value ? '1' : '0');

    // Append image safely
    if (this.profileImageFile) {
      formData.append('image', this.profileImageFile);
    }

    this.apiService.saveTestimonial(formData, this.editingId ?? undefined).subscribe(
      res => {
        this.closeForm();
        this.profileImageFile = null;
        this.previewFileUrl = null;
        this.currentProfileImage = null;
        this.TestimonialForm.reset({ status: true });
        this.loadTestimoniallist();
      },
      err => console.error(err)
    );

  }


  // Delete confirmation
  openDeleteConfirm(id: number): void {
    this.confirmDeleteId = id;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  confirmDelete(): void {
    if (this.confirmDeleteId) {
      this.apiService.deleteTestimonial(this.confirmDeleteId).subscribe(
        res => {
          this.cancelDelete();
          this.loadTestimoniallist();
        },
        err => console.error(err)
      );
    }
  }

  // Helper to get image URL
  getImageUrl(image: string | null): string {
    return image ? `${this.apiService.getBaseUrl()}/${image}` : 'assets/default-profile.png';
  }

}
