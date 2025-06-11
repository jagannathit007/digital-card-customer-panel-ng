import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Editor, Toolbar } from 'ngx-editor';
import { NgxEditorModule } from 'ngx-editor';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ModalService } from 'src/app/core/utilities/modal';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { WebsiteBuilderService } from 'src/app/services/website-builder.service';
import { common } from 'src/app/core/constants/common';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs.component.html',
  styleUrl: './blogs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef;

  private objectURLCache = new Map<File, string>();

  constructor(
    public modal: ModalService,
    private storage: AppStorage,
    private authService: AuthService,
    private websiteService: WebsiteBuilderService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  businessCardId: any;
  blogVisible: boolean = false;
  blogs: any[] = [];
  filteredBlogs: any[] = [];
  totalItems: number = 0;
  searchTerm: string = '';
  itemsPerPage: number = 10;
  p: number = 1;
  isLoading: boolean = false;
  imageBaseURL = environment.imageURL;

  // Editor instances for title and description
  titleEditor: Editor = new Editor();
  descriptionEditor: Editor = new Editor();

  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  selectedBlog: any = {
    _id: null,
    title: '',
    images: [] as File[],
    description: '',
    visible: true,
    existingImages: [],
  };

  imageForCarousel: any[] = [];

  ngOnInit() {
    this.businessCardId = this.storage.get(common.BUSINESS_CARD);
    if (!this.businessCardId) {
      console.error('businessCardId is missing in storage');
      swalHelper.showToast('Business card ID is missing. Please try again.', 'error');
      return;
    }
    this._getBlogs();
  }

  ngAfterViewInit() {
    this.cdr.markForCheck();
  }

  ngOnDestroy() {
    this.titleEditor.destroy();
    this.descriptionEditor.destroy();
    this.objectURLCache.forEach((url) => URL.revokeObjectURL(url));
  }

  async _getBlogs() {
    this.isLoading = true;
    try {
      const results = await this.authService.getWebsiteDetails(this.businessCardId);
      if (results) {
        this.blogs = results.blogs ? [...results.blogs] : [];
        this.filteredBlogs = [...this.blogs];
        this.totalItems = this.blogs.length;
        this.blogVisible = results.blogVisible || false;
        this.cdr.markForCheck();
      } else {
        swalHelper.showToast('Failed to fetch blogs!', 'warning');
      }
    } catch (error) {
      console.error('Error fetching blogs: ', error);
      swalHelper.showToast('Error fetching blogs!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredBlogs = [...this.blogs];
    } else {
      this.filteredBlogs = this.blogs.filter(
        (blog) =>
          this.stripHtml(blog.title)
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()) ||
          (blog.description &&
            this.stripHtml(blog.description)
              .toLowerCase()
              .includes(this.searchTerm.toLowerCase()))
      );
    }
    this.totalItems = this.filteredBlogs.length;
    this.p = 1;
    this.cdr.markForCheck();
  }

  onItemsPerPageChange() {
    this.p = 1;
    this.cdr.markForCheck();
  }

  onPageChange(page: number) {
    this.p = page;
    this.cdr.markForCheck();
  }

  onOpenCreateModal() {
    this.selectedBlog = {
      _id: null,
      title: '',
      images: [],
      description: '',
      visible: true,
      existingImages: [],
    };
    this.modal.open('create-blogs');
    this.cdr.markForCheck();
  }

  onOpenUpdateModal(item: any) {
    this.selectedBlog = {
      ...item,
      images: [],
      existingImages: item.images ? [...item.images] : [],
      title: item.title || '',
      description: item.description || '',
      visible: item.visible !== undefined ? item.visible : true,
    };
    this.modal.open('create-blogs');
    this.cdr.markForCheck();
  }

  onCloseModal(modal: string) {
    this._reset();
    this.modal.close(modal);
    this.cdr.markForCheck();
  }

  onCancel() {
    this._reset();
    this.modal.close('create-blogs');
    this.cdr.markForCheck();
  }

  onUploadImage(event: any) {
    const files: FileList = event.target.files;
    const newFiles: File[] = Array.from(files);

    if (!this.selectedBlog.images) {
      this.selectedBlog.images = [];
    }

    const totalImages = this.selectedBlog.images.length + this.selectedBlog.existingImages.length + newFiles.length;
    if (totalImages > 5) {
      swalHelper.warning('You can upload a maximum of 5 images.');
      this.selectedBlog.images = [];
      this.fileInputRef.nativeElement.value = '';
      this.cdr.markForCheck();
      return;
    }

    let validImages: File[] = [];
    let processed = 0;

    for (let file of newFiles) {
      const reader = new FileReader();
      reader.onload = () => {
        validImages.push(file);
        processed++;
        if (processed === newFiles.length) {
          this.selectedBlog.images.push(...validImages);
          this.cdr.markForCheck();
        }
      };
      reader.readAsDataURL(file);
    }
  }

  getImagePreview(img: any): string {
    if (img instanceof File) {
      if (!this.objectURLCache.has(img)) {
        const url = URL.createObjectURL(img);
        this.objectURLCache.set(img, url);
      }
      return this.objectURLCache.get(img)!;
    }
    return this.imageBaseURL + img;
  }

  removeImage(index: number, isExisting: boolean = false) {
    if (isExisting) {
      this.selectedBlog.existingImages.splice(index, 1);
    } else {
      const removedImage = this.selectedBlog.images[index];
      this.selectedBlog.images.splice(index, 1);
      if (this.objectURLCache.has(removedImage)) {
        URL.revokeObjectURL(this.objectURLCache.get(removedImage)!);
        this.objectURLCache.delete(removedImage);
      }
    }

    if (this.selectedBlog.images.length === 0 && this.selectedBlog.existingImages.length === 0) {
      this.fileInputRef.nativeElement.value = '';
    }
    this.cdr.markForCheck();
  }

  async onCreateBlog() {
    const strippedTitle = this.stripHtml(this.selectedBlog.title).trim();
    if (!strippedTitle) {
      swalHelper.showToast('Blog title is required!', 'warning');
      return;
    }

    const strippedDescription = this.stripHtml(this.selectedBlog.description).trim();
    if (!strippedDescription) {
      swalHelper.showToast('Blog description is required!', 'warning');
      return;
    }

    const formdata = new FormData();
    formdata.append('title', this.selectedBlog.title);
    formdata.append('description', this.selectedBlog.description);
    formdata.append('businessCardId', this.businessCardId);
    formdata.append('visible', String(this.selectedBlog.visible));
    if (this.selectedBlog._id) {
      formdata.append('blogId', this.selectedBlog._id);
    }
    if (this.selectedBlog.existingImages.length > 0) {
      formdata.append('existingImages', JSON.stringify(this.selectedBlog.existingImages));
    }

    this.selectedBlog.images.forEach((file: File) => {
      formdata.append('images', file);
    });

    this.isLoading = true;
    try {
      await this.websiteService.updateBlogs(formdata);
      await this._getBlogs();
      this.modal.close('create-blogs');
      this._reset();
      swalHelper.showToast('Blog saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving blog: ', error);
      swalHelper.showToast('Error saving blog!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  async _deleteBlog(id: string) {
    try {
      const confirm = await swalHelper.delete();
      if (confirm.isConfirmed) {
        await this.websiteService.deleteBlogs({
          blogId: id,
          businessCardId: this.businessCardId,
        });
        await this._getBlogs();
        swalHelper.showToast('Blog deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting blog: ', error);
      swalHelper.showToast('Error deleting blog!', 'error');
    }
  }

  async _updateVisibility() {
    try {
      await this.websiteService.updateVisibility({
        blogVisible: this.blogVisible,
        businessCardId: this.businessCardId,
      });
    } catch (error) {
      console.error('Error updating visibility: ', error);
      swalHelper.showToast('Error updating visibility!', 'error');
    }
  }

  onOpenImageModal(images: any[]) {
    this.imageForCarousel = images;
    this.modal.open('image-carousel');
    this.cdr.markForCheck();
  }

  _reset() {
    this.selectedBlog = {
      _id: null,
      title: '',
      images: [],
      description: '',
      visible: true,
      existingImages: [],
    };
    this.searchTerm = '';
    this.itemsPerPage = 10;
    this.p = 1;
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.value = '';
    }
    this.objectURLCache.forEach((url) => URL.revokeObjectURL(url));
    this.objectURLCache.clear();
    this.cdr.markForCheck();
  }

  sanitizeHtml(content: any): any {
    if (!content) return '';
    return content.replace(/<[^>]*>/g, '');
  }

  stripHtml(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}