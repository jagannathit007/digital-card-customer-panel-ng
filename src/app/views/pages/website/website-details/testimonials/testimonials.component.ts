import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';


@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
  ],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss',
})
export class TestimonialsComponent implements OnInit {
  baseURL = environment.baseURL;
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;

  
  testimonialList: any[] = [];
  filteredTestimonialList: any[] = [];
  testimonialID: string = '';
  // ROW IMAGE VARABLE
  selectedImage: string = '';

  newTestimonial = {
    clientName: '',
    rating: null,
    feedback: '',
    image: null as File | null 
  };

  editingTestimonial = {
    _id: '',
    clientName: '',
    rating: null,
    feedback: '',
    image: null as File | null,
    currentImage: [] as string[]
  };

  
  constructor(private storage: AppStorage, public authService: AuthService) {}
  
  async ngOnInit() {
    await this.fetchWebsiteDetails();
  }

  async fetchWebsiteDetails() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let results = await this.authService.getWebsiteDetails(businessCardId);
      
      if (results) {
        this.testimonialList = results.testimonials ? [...results.testimonials] : [];
        this.filteredTestimonialList = [...this.testimonialList];
        this.totalItems = this.testimonialList.length;
      } else {
        swalHelper.showToast('Failed to fetch testimonials!', 'warning');
      }
    } catch (error) {
      console.error('Error fetching website details: ', error);
      swalHelper.showToast('Error fetching testimonials!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async addTestimonial() {
    if (!this.validateTestimonial(this.newTestimonial)) {
      return;
    }

    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      
      const formData = new FormData();
      formData.append('businessCardId', businessCardId);
      formData.append('clientName', this.newTestimonial.clientName);
      formData.append('rating', String(this.newTestimonial.rating));
      formData.append('feedback', this.newTestimonial.feedback);
      
      if (this.newTestimonial.image) {
        formData.append('file', this.newTestimonial.image);
      }
  
      const result = await this.authService.addTestimonials(formData);
      
      if (result) {
        this.testimonialList = [result, ...this.testimonialList];
        this.filteredTestimonialList = [...this.testimonialList];
        this.totalItems = this.testimonialList.length;
        
        await this.fetchWebsiteDetails();
        this.resetForm();
        
        const modal = document.getElementById('AddTestimonialModal');
        if (modal) {
          (modal as any).querySelector('.btn-close')?.click(); 
        }
        
        swalHelper.showToast('Testimonial added successfully!', 'success');
      }
    } catch (error) {
      console.error('Error adding testimonial: ', error);
      swalHelper.showToast('Error adding testimonial!', 'error');
    } finally {
      this.isLoading = false;
    }
  }


  
  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.newTestimonial.image = event.target.files[0];
    }
  }

  onEditFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.editingTestimonial.image = event.target.files[0];
    }
  }
  
  resetForm() {
    this.newTestimonial = {
      clientName: '',
      rating: null,
      feedback: '',
      image: null
    };
  }

  editTestimonial(testimonial: any) {
    this.editingTestimonial = {
      _id: testimonial._id,
      clientName: testimonial.clientName,
      rating: testimonial.rating,
      feedback: testimonial.feedback,
      image: null,
      currentImage: testimonial.image || []
    };
  }

  async updateTestimonial() {
    if (!this.validateTestimonial(this.editingTestimonial)) {
      return;
    }

    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      
      // Create FormData
      const formData = new FormData();
      formData.append('businessCardId', businessCardId);
      formData.append('testimonialId', this.editingTestimonial._id);
      formData.append('clientName', this.editingTestimonial.clientName);
      formData.append('rating', String(this.editingTestimonial.rating));
      formData.append('feedback', this.editingTestimonial.feedback);
      
      if (this.editingTestimonial.image) {
        formData.append('file', this.editingTestimonial.image);
      }
  
      // Call the service method
      const result = await this.authService.updateTestimonials(formData);
      
      if (result) {
        // Update the testimonial in the list
        const index = this.testimonialList.findIndex(t => t._id === this.editingTestimonial._id);
        if (index !== -1) {
          this.testimonialList[index] = result;
          this.filteredTestimonialList = [...this.testimonialList];
        }

        await this.fetchWebsiteDetails();
        this.resetForm();
        
        const modal = document.getElementById('EditTestimonialsModal');
        if (modal) {
          (modal as any).querySelector('.btn-close')?.click(); 
        }
        
        swalHelper.showToast('Testimonial updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating testimonial: ', error);
      swalHelper.showToast('Error updating testimonial!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async confirmDeleteTestimonial() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      
      const data = {
        businessCardId: businessCardId,
        testimonialId: this.testimonialID
      };
  
      const result = await this.authService.deleteTestimonials(data);
      
      if (result) {
        // Remove the testimonial from the list
        this.testimonialList = this.testimonialList.filter(t => t._id !== this.testimonialID);
        this.filteredTestimonialList = [...this.testimonialList];
        this.totalItems = this.testimonialList.length;
        
        await this.fetchWebsiteDetails();
        this.resetForm();
        
        const modal = document.getElementById('deleteTestimonialsModal');
        if (modal) {
          (modal as any).querySelector('.btn-close')?.click(); 
        }
        
        swalHelper.showToast('Testimonial deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting testimonial: ', error);
      swalHelper.showToast('Error deleting testimonial!', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  // Store testimonial ID for deletion
  deleteTestimonials(testimonialID: string) {
    this.testimonialID = testimonialID;
  }

  // Validate testimonial data
  validateTestimonial(testimonial: any): boolean {
    if (!testimonial.clientName.trim()) {
      swalHelper.showToast('Client name is required!', 'warning');
      return false;
    }
    
    if (!testimonial.rating || testimonial.rating < 1 || testimonial.rating > 5) {
      swalHelper.showToast('Rating must be between 1 and 5!', 'warning');
      return false;
    }
    
    if (!testimonial.feedback.trim()) {
      swalHelper.showToast('Feedback is required!', 'warning');
      return false;
    }
    
    return true;
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredTestimonialList = [...this.testimonialList];
    } else {
      this.filteredTestimonialList = this.testimonialList.filter(testimonial =>
        testimonial.clientName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        testimonial.feedback.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.totalItems = this.filteredTestimonialList.length;
  }

  onItemsPerPageChange() {
    this.p = 1;
  }

  pageChangeEvent(event: number) {
    this.p = event;
  }
}