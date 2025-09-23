import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  homeForm!: FormGroup;
  responseMessage = '';
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private apiService: ApiService) { }

  ngOnInit(): void {
    this.homeForm = this.fb.group({
      header_name: ['', Validators.required],
      description: ['', Validators.required],
      file: [null, Validators.required],
      status: [true]
    });
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.homeForm.patchValue({ file: this.selectedFile });
    } else {
      this.homeForm.patchValue({ file: null });
    }
    this.homeForm.get('file')!.updateValueAndValidity();
  }


  onSubmit() {
    if (this.homeForm.invalid) return;

    const formData = new FormData();
    formData.append('header_name', this.homeForm.get('header_name')!.value);
    formData.append('description', this.homeForm.get('description')!.value);
    formData.append('status', this.homeForm.get('status')!.value ? '1' : '0');
    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

    this.apiService.post<any>('home_content.php', formData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.responseMessage = 'Content saved successfully with ID ' + res.id;

          // Reset form including file
          this.homeForm.reset({ status: true });
          this.selectedFile = null;

          // Reset the actual <input type="file"> element in DOM
          const fileInput = document.getElementById('formFile') as HTMLInputElement;
          if (fileInput) fileInput.value = '';

          // Clear message after 3 seconds
          setTimeout(() => {
            this.responseMessage = '';
          }, 3000);

        } else {
          this.responseMessage = 'Failed: ' + (res.error || 'Unknown error');

          setTimeout(() => {
            this.responseMessage = '';
          }, 3000);
        }
      },
      error: (err) => {
        console.error('API error:', err);
        this.responseMessage = 'Error: ' + (err.error?.error || 'Server error');

        setTimeout(() => {
          this.responseMessage = '';
        }, 3000);
      }
    });
  }

}
