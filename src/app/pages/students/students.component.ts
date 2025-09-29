import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent implements OnInit {
  studentlist: any[] = [];
  selectedStudent: any = null;
  showViewModal: boolean = false;
  confirmDeleteId: number | null = null;

  constructor(public apiService: ApiService) { }

  ngOnInit(): void {
    this.loadStudentlist();
  }

  // Load all students
  loadStudentlist(): void {
    this.apiService.getAllStudents().subscribe({
      next: (res) => {
        this.studentlist = res;
      },
      error: (err) => {
        console.error('Error fetching student list', err);
      }
    });
  }

  // Get CSS class based on status
  getStatusClass(status: number): string {
    return status === 1 ? 'badge bg-success' : 'badge bg-danger';
  }

  // Open student view modal

  // Open student view modal
  viewStudentRecord(student: any): void {
    this.selectedStudent = {
      ...student,
      profile_image_url: student.profile_image
        ? this.apiService.getBaseUrl() + '/' + student.profile_image
        : null
    };
    this.showViewModal = true;
  }

  // Close student view modal
  closeViewModal(): void {
    this.selectedStudent = null;
    this.showViewModal = false;
  }

  // Open delete confirmation modal
  openDeleteConfirm(id: number): void {
    this.confirmDeleteId = id;
  }

  // Cancel delete
  cancelDelete(): void {
    this.confirmDeleteId = null;
  }

  // Confirm delete student
  confirmDelete(): void {
    if (this.confirmDeleteId !== null) {
      this.apiService.deleteStudent(this.confirmDeleteId).subscribe({
        next: (res) => {
          // Remove deleted student from list
          this.studentlist = this.studentlist.filter(
            (s) => s.id !== this.confirmDeleteId
          );
          this.confirmDeleteId = null;
        },
        error: (err) => {
          console.error('Error deleting student', err);
          this.confirmDeleteId = null;
        }
      });
    }
  }
  toggleStatus(item: any): void {
    const newStatus = item.status === 1 ? 0 : 1;
    this.apiService.updateStudentStatus(item.id, newStatus).subscribe({
      next: (res) => {
        if (res.success) {
          item.status = newStatus;
        }
      },
      error: (err) => {
        console.error('Error updating status', err);
      }
    });
  }

}