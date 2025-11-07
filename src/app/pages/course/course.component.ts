import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss']
})
export class CourseComponent implements OnInit {
  courselist: any[] = [];
  courseForm!: FormGroup;
  showFormModal = false;
  confirmDeleteId: number | null = null;
  editingId: number | null = null;

  // 👇 These two are missing earlier
  profileFile: File | null = null;   // to hold uploaded file
  currentFile: string | null = null; // existing file when editing

  constructor(private fb: FormBuilder, public api: ApiService) { }

  ngOnInit() {
    this.loadCourse();
    this.initForm();
  }

  initForm() {
    this.courseForm = this.fb.group({
      header_name: ['', Validators.required],
      short_description: [''],
      description: ['', Validators.required],
      course_duration: ['', Validators.required],
      course_level: ['', Validators.required],
      course_instructor: ['', Validators.required],
      max_students: ['', Validators.required, Validators.pattern(/^[0-9]+$/), Validators.min(1)],
      status: [true]
    });
  }

  loadCourse() {
    this.api.getAllCourse().subscribe((res) => {
      this.courselist = res;
    });
  }

  openForm(course: any = null) {
    this.showFormModal = true;
    this.editingId = course ? course.id : null;
    this.profileFile = null;

    if (course) {
      this.currentFile = course.file_path;
      this.courseForm.patchValue({
        header_name: course.header_name,
        short_description: course.short_description,
        description: course.description,
        course_duration: course.course_duration,
        course_level: course.course_level,
        course_instructor: course.course_instructor,
        max_students: course.max_students,
        status: !!course.status
      });
    } else {
      this.currentFile = null;
      this.courseForm.reset({ status: true });
    }
  }

  closeForm() {
    this.showFormModal = false;
    this.editingId = null;
    this.profileFile = null;
    this.courseForm.reset({ status: true });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profileFile = file;
    }
  }

  getFileType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext!)) return 'image';
    return 'other';
  }

  onSubmit() {
    if (this.courseForm.invalid) return;

    const formData = new FormData();
    Object.keys(this.courseForm.controls).forEach((key) => {
      formData.append(key, this.courseForm.get(key)?.value);
    });

    if (this.profileFile) {
      formData.append('file', this.profileFile);
    }

    if (this.editingId) {
      formData.append('id', this.editingId.toString());
    }

    this.api.createOrUpdateCourse(formData).subscribe({
      next: (res) => {
        // alert(res.message || 'Course saved successfully');
        this.closeForm();
        this.loadCourse();
      },
      error: (err) => {
        console.error(err);
        alert('Error while saving course');
      },
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
      this.api.deleteCourseById(this.confirmDeleteId).subscribe({
        next: (res) => {
          // alert('Course deleted successfully');
          this.confirmDeleteId = null;
          this.loadCourse();
        },
        error: (err) => {
          console.error(err);
          alert('Error deleting course');
        },
      });
    }
  }
}
