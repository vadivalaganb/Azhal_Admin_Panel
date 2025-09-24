import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../shared/services/api.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  // Sections
  aboutForm: FormGroup;
  homeContents: any[] = [];
  showFormModal = false;
  editingId: number | null = null;
  editingFilePreview: string | null = null;
  selectedFile: File | null = null;

  // Items
  itemForm: FormGroup;
  itemsForSection: any[] = [];
  showItemsModal = false;
  currentSectionForItems: any | null = null;
  editingItemId: number | null = null;
  confirmDeleteId: number | null = null;
  confirmDeleteItemId: number | null = null;

  constructor(private fb: FormBuilder, public apiService: ApiService) {
    // Section form
    this.aboutForm = this.fb.group({
      section_key: ['', Validators.required],
      header_name: ['', Validators.required],
      description: ['', Validators.required],
      status: [true],
      file: [null]
    });

    // Item form
    this.itemForm = this.fb.group({
      section_id: [null, Validators.required],
      icon: ['', Validators.required],
      subtitle: ['', Validators.required],
      description: ['', Validators.required],
      status: [true]
    });
  }

  ngOnInit(): void {
    this.loadContents();
  }

  // ---------------- Sections ----------------
  loadContents(): void {
    this.apiService.getAboutSections().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.homeContents = data;
        } else if (data && Array.isArray((data as any).data)) {
          this.homeContents = (data as any).data;
        } else {
          this.homeContents = [];
        }
      },
      error: (err) => {
        console.error('Failed to load sections', err);
      }
    });
  }

  openForm(): void {
    this.editingId = null;
    this.selectedFile = null;
    this.editingFilePreview = null;
    this.aboutForm.reset({ section_key: '', header_name: '', description: '', status: true, file: null });
    this.showFormModal = true;
  }

  closeForm(): void {
    this.showFormModal = false;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) this.selectedFile = input.files[0];
    else this.selectedFile = null;
  }

  editContent(item: any): void {
    this.editingId = item.id;
    this.selectedFile = null;
    this.editingFilePreview = item.file_path || null;
    const statusBool = (item.status === 1 || item.status === '1' || item.status === true);
    this.aboutForm.patchValue({
      section_key: item.section_key,
      header_name: item.header_name,
      description: item.description,
      status: statusBool,
      file: null
    });
    this.showFormModal = true;
  }

  onSubmit(): void {
    if (this.aboutForm.invalid) {
      this.aboutForm.markAllAsTouched();
      return;
    }
    const fv = this.aboutForm.value;
    const formData = new FormData();
    formData.append('section_key', fv.section_key);
    formData.append('header_name', fv.header_name);
    formData.append('description', fv.description);
    formData.append('status', fv.status ? '1' : '0');

    if (this.selectedFile) formData.append('file', this.selectedFile, this.selectedFile.name);
    else if (this.editingFilePreview) formData.append('existing_file', this.editingFilePreview);

    if (this.editingId) {
      this.apiService.updateAboutSection(this.editingId, formData).subscribe({
        next: () => { this.loadContents(); this.closeForm(); },
        error: (err) => console.error('Update failed', err)
      });
    } else {
      this.apiService.createAboutSection(formData).subscribe({
        next: () => { this.loadContents(); this.closeForm(); },
        error: (err) => console.error('Create failed', err)
      });
    }
  }

  openDeleteConfirm(id: number): void {
    this.confirmDeleteId = id;
  }
  cancelDelete(): void { this.confirmDeleteId = null; }
  confirmDelete(): void {
    if (!this.confirmDeleteId) return;
    this.apiService.deleteAboutSection(this.confirmDeleteId).subscribe({
      next: () => { this.loadContents(); this.confirmDeleteId = null; },
      error: (err) => console.error('Delete failed', err)
    });
  }

  // ---------------- Items ----------------
  // Open items modal for a specific section
  openItemsForSection(section: any): void {
    this.currentSectionForItems = section;
    this.loadItems(section.id);
    this.showItemsModal = true;
  }

  closeItemsModal(): void {
    this.showItemsModal = false;
    this.currentSectionForItems = null;
    this.itemsForSection = [];
    this.editingItemId = null;
    this.itemForm.reset();
  }

  loadItems(sectionId: number): void {
    this.apiService.getAboutItems(sectionId).subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) this.itemsForSection = data;
        else if (data && Array.isArray((data as any).data)) this.itemsForSection = (data as any).data;
        else this.itemsForSection = [];
      },
      error: (err) => console.error('Failed to load items', err)
    });
  }

  // open add item form
  openAddItem(): void {
    if (!this.currentSectionForItems) return;
    this.editingItemId = null;
    this.itemForm.reset({
      section_id: this.currentSectionForItems.id,
      icon: '',
      subtitle: '',
      description: '',
      status: true
    });
  }

  // edit item
  editItem(item: any): void {
    this.editingItemId = item.id;
    this.itemForm.patchValue({
      section_id: item.section_id,
      icon: item.icon,
      subtitle: item.subtitle,
      description: item.description,
      status: (item.status === 1 || item.status === '1' || item.status === true)
    });
  }

  submitItem(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }
    const fv = this.itemForm.value;
    const payload = {
      section_id: fv.section_id,
      icon: fv.icon,
      subtitle: fv.subtitle,
      description: fv.description,
      status: fv.status ? 1 : 0
    };

    if (this.editingItemId) {
      this.apiService.updateAboutItem(this.editingItemId, payload).subscribe({
        next: () => this.loadItems(this.currentSectionForItems!.id),
        error: (err) => console.error('Update item failed', err)
      });
    } else {
      this.apiService.createAboutItem(payload).subscribe({
        next: () => this.loadItems(this.currentSectionForItems!.id),
        error: (err) => console.error('Create item failed', err)
      });
    }
    // clear form
    this.editingItemId = null;
    this.itemForm.reset({ section_id: this.currentSectionForItems!.id, icon: '', subtitle: '', description: '', status: true });
  }

  // item delete flows
  openDeleteItemConfirm(id: number): void { this.confirmDeleteItemId = id; }
  cancelDeleteItem(): void { this.confirmDeleteItemId = null; }
  confirmDeleteItem(): void {
    if (!this.confirmDeleteItemId) return;
    this.apiService.deleteAboutItem(this.confirmDeleteItemId).subscribe({
      next: () => this.loadItems(this.currentSectionForItems!.id),
      error: (err) => console.error('Delete item failed', err)
    });
    this.confirmDeleteItemId = null;
  }
}
