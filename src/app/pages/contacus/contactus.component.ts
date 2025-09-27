import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contactus',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contactus.component.html',
  styleUrls: ['./contactus.component.scss']
})
export class ContactUsComponent implements OnInit {
  contactuslist: any[] = [];
  selectedContact: any = null;

  // Delete confirmation
  confirmDeleteId: number | null = null;

  // Status update confirmation
  confirmStatusId: number | null = null;
  newStatus: string = '';

  // Modal control
  showViewModal: boolean = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadContactUslist();
  }

  // Load all contacts
  loadContactUslist(): void {
    this.api.getContactUsContent().subscribe({
      next: (res) => this.contactuslist = res,
      error: (err) => console.error('Error loading contacts:', err)
    });
  }

  // Open view modal
  viewContactUs(item: any): void {
    this.selectedContact = item;
    this.showViewModal = true;
  }

  // Close view modal
  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedContact = null;
  }

  // ----------------- Delete -----------------
  openDeleteConfirm(id: number): void {
    this.confirmDeleteId = id;
  }

  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  confirmDelete(): void {
    if (this.confirmDeleteId !== null) {
      this.api.deleteContactUs(this.confirmDeleteId).subscribe({
        next: () => {
          this.contactuslist = this.contactuslist.filter(c => c.id !== this.confirmDeleteId);
          this.confirmDeleteId = null;
        },
        error: (err) => console.error('Error deleting record:', err)
      });
    }
  }

  // ----------------- Status Update -----------------
  openStatusConfirm(id: number, status: string): void {
    this.confirmStatusId = id;
    this.newStatus = status;
  }

  cancelStatusUpdate(): void {
    this.confirmStatusId = null;
    this.newStatus = '';
  }

  confirmStatusUpdate(): void {
    if (this.confirmStatusId !== null && this.newStatus) {
      this.api.updateContactStatus(this.confirmStatusId, this.newStatus).subscribe({
        next: () => {
          const contact = this.contactuslist.find(c => c.id === this.confirmStatusId);
          if (contact) contact.status = this.newStatus;

          // If the modal is open and this is the selected contact, update its status too
          if (this.selectedContact?.id === this.confirmStatusId) {
            this.selectedContact.status = this.newStatus;
          }

          this.confirmStatusId = null;
          this.newStatus = '';
        },
        error: (err) => console.error('Error updating status:', err)
      });
    }
  }

  // Optional: Helper for status class for SCSS highlighting
  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'new': return 'status-new';
      case 'in_progress': return 'status-in-progress';
      case 'resolved': return 'status-resolved';
      default: return 'status-unknown';
    }
  }
}
