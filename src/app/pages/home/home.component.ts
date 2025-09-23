import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, CommonModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  homeForm!: FormGroup;
  homeContents: any[] = [];
  selectedFile: File | null = null;
  responseMessage = '';
  showFormModal = false;
  editingId: number | null = null;
  editingFilePreview: string | null = null;
  confirmDeleteId: number | null = null;
  constructor(private fb: FormBuilder, public apiService: ApiService, private http: HttpClient) { }

  ngOnInit(): void {
    this.homeForm = this.fb.group({
      header_name: ['', Validators.required],
      description: ['', Validators.required],
      file: [null],
      status: [true]
    });
    this.loadHomeContents();
  }

  // Open form modal
  openForm() {
    this.showFormModal = true;
    this.editingId = null;
    this.editingFilePreview = null;
    this.homeForm.reset({ status: true });
    this.selectedFile = null;
  }

  closeForm() {
    this.showFormModal = false;
  }

  // File change
  onFileChange(event: any) {
    const file = event.target.files.length > 0 ? event.target.files[0] : null;
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
      const maxSizeMB = 2;
      if (!allowedTypes.includes(file.type)) {
        alert('Only image files (png, jpeg, jpg, gif) are allowed.');
        this.selectedFile = null;
        this.homeForm.patchValue({ file: null });
        event.target.value = ''; // reset file input
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File size should not exceed ${maxSizeMB} MB.`);
        this.selectedFile = null;
        this.homeForm.patchValue({ file: null });
        event.target.value = '';
        return;
      }
      this.selectedFile = file;
      this.homeForm.patchValue({ file: this.selectedFile });
    } else {
      this.selectedFile = null;
      this.homeForm.patchValue({ file: null });
    }
    this.homeForm.get('file')!.updateValueAndValidity();
  }

  // onFileChange(event: any) {
  //   if (event.target.files.length > 0) {
  //     this.selectedFile = event.target.files[0];
  //     this.homeForm.patchValue({ file: this.selectedFile });
  //   } else {
  //     this.homeForm.patchValue({ file: null });
  //   }
  //   this.homeForm.get('file')!.updateValueAndValidity();
  // }

  // Load all contents
  loadHomeContents() {
    this.apiService.get<any[]>('home_content.php').subscribe({
      next: (res) => {
        this.homeContents = Array.isArray(res) ? res : [];
        console.log("Loaded list:", this.homeContents); // debug
      },
      error: (err) => {
        console.error('Failed loading:', err);
        this.homeContents = [];
      }
    });
  }

  // Submit form (Add / Edit)
  onSubmit() {
    if (this.homeForm.invalid) return;

    const formData = new FormData();
    formData.append('header_name', this.homeForm.get('header_name')!.value);
    formData.append('description', this.homeForm.get('description')!.value);

    // ensure status is always appended as '1' or '0'
    const statusValue = this.homeForm.get('status')!.value ? '1' : '0';
    formData.append('status', statusValue);

    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    } else if (this.editingFilePreview) {
      formData.append('existing_file', this.editingFilePreview);
    }

    if (this.editingId !== null) {
      formData.append('id', this.editingId.toString());
    }

    // DEBUG: inspect formData content in console
    for (const pair of (formData as any).entries()) {
      console.log(pair[0] + ':', pair[1]);
    }

    this.apiService.post('home_content.php', formData).subscribe({
      next: (res: any) => {
        this.responseMessage = this.editingId !== null ? 'Content updated successfully' : 'Content added successfully';
        this.showFormModal = false;
        this.loadHomeContents();
        this.editingId = null;
        this.editingFilePreview = null;
        this.selectedFile = null;
        this.homeForm.reset({ status: true });
      },
      error: (err) => {
        console.error(err);
      }
    });
  }



  // Edit
  editContent(item: any) {
    this.editingId = item.id; // Make sure this is not reset elsewhere
    this.homeForm.patchValue({
      header_name: item.header_name,
      description: item.description,
      status: item.status == 1,
      file: null // user must select new file if they want to override
    });
    this.editingFilePreview = item.file_path;
    this.selectedFile = null;
    this.showFormModal = true;
  }


  // Delete
  deleteContent(id: number) {
    if (!confirm('Are you sure you want to delete this content?')) return;

    this.apiService.delete('home_content.php?id=' + id).subscribe({
      next: (res: any) => {
        this.responseMessage = 'Content deleted successfully';
        this.loadHomeContents();
      },
      error: (err: any) => console.error(err)
    });

  }
  openDeleteConfirm(id: number) {
    this.confirmDeleteId = id;
  }

  cancelDelete() {
    this.confirmDeleteId = null;
  }

  confirmDelete() {
    if (this.confirmDeleteId !== null) {
      this.apiService.delete('home_content.php?id=' + this.confirmDeleteId).subscribe({
        next: (res: any) => {
          this.responseMessage = 'Content deleted successfully';
          this.loadHomeContents();
        },
        error: (err: any) => console.error(err)
      });
      this.confirmDeleteId = null;
    }
  }

}
