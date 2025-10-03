import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-ourteam',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, CommonModule],
  templateUrl: './ourteam.component.html',
  styleUrls: ['./ourteam.component.scss']
})
export class OurTeamComponent implements OnInit {
  ourTeamForm!: FormGroup;
  ourTeamContents: any[] = [];
  showFormModal = false;
  editingId: number | null = null;
  confirmDeleteId: number | null = null;
  selectedFile: File | null = null;
  currentProfileImage: string | null = null;

  constructor(private fb: FormBuilder, public apiService: ApiService) { }

  ngOnInit(): void {
    this.initForm();
    this.loadTeamContents();
  }

  initForm() {
    this.ourTeamForm = this.fb.group({
      person_name: ['', Validators.required],
      designation: ['', Validators.required],
      icon: [''],
      status: [true],
      socialLinks: this.fb.array([])   // 👈 dynamic array
    });
  }

  // convenience getter
  get socialLinks(): FormArray {
    return this.ourTeamForm.get('socialLinks') as FormArray;
  }

  addSocialLink(icon = '', url = '') {
    this.socialLinks.push(
      this.fb.group({
        icon: [icon, Validators.required],
        url: [url, Validators.required]
      })
    );
  }

  removeSocialLink(index: number) {
    this.socialLinks.removeAt(index);
  }

  // open add/edit modal
  openForm(item?: any) {
    if (item) {
      this.editingId = item.id;
      this.ourTeamForm.patchValue({
        person_name: item.name,
        designation: item.designation,
        icon: item.icon,
        status: item.status == 1
      });

      // Social links
      this.socialLinks.clear();
      if (item.social_links && Array.isArray(item.social_links)) {
        item.social_links.forEach((link: any) =>
          this.addSocialLink(link.icon, link.url)
        );
      }

      // Set current profile image
      this.currentProfileImage = item.profile_image; // store existing image path
    } else {
      this.editingId = null;
      this.ourTeamForm.reset({ status: true });
      this.socialLinks.clear();
      this.currentProfileImage = null;
    }
    this.showFormModal = true;
  }

  closeForm() {
    this.showFormModal = false;
    this.editingId = null;
    this.selectedFile = null;
    this.currentProfileImage = null; // reset preview
    this.ourTeamForm.reset({ status: true });
    this.socialLinks.clear();
  }


  onFileChange(event: any) {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    this.selectedFile = file;

    // Use FileReader to generate a preview URL
    const reader = new FileReader();
    reader.onload = () => {
      // Update the preview image with base64 string
      this.currentProfileImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }




  onSubmit() {
    if (this.ourTeamForm.invalid) return;

    const formData = new FormData();
    formData.append('name', this.ourTeamForm.value.person_name);
    formData.append('designation', this.ourTeamForm.value.designation);
    formData.append('status', this.ourTeamForm.value.status ? '1' : '0');

    // convert socialLinks FormArray to JSON string
    formData.append('social_links', JSON.stringify(this.ourTeamForm.value.socialLinks));

    // ensure profile image is added
    if (this.selectedFile) {
      formData.append('profile_image', this.selectedFile, this.selectedFile.name);
    }

    // handle edit case
    if (this.editingId) {
      formData.append('id', this.editingId.toString());
      formData.append('_method', 'PUT');
    }

    this.apiService.saveTeamMember(formData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.loadTeamContents();
          this.closeForm();
        } else {
          alert(res.error || 'Something went wrong');
        }
      },
      error: (err) => {
        console.error(err);
        alert('Error saving record');
      }
    });
  }


  loadTeamContents() {
    this.apiService.getTeamMembers().subscribe({
      next: (res) => {
        this.ourTeamContents = res;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  openDeleteConfirm(id: number) {
    this.confirmDeleteId = id;
  }

  cancelDelete() {
    this.confirmDeleteId = null;
  }

  confirmDelete() {
    if (!this.confirmDeleteId) return;

    this.apiService.deleteTeamMember(this.confirmDeleteId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.loadTeamContents();
        } else {
          alert(res.error || 'Delete failed');
        }
        this.confirmDeleteId = null;
      },
      error: (err) => {
        console.error(err);
        alert('Error deleting record');
        this.confirmDeleteId = null;
      }
    });
  }
}
