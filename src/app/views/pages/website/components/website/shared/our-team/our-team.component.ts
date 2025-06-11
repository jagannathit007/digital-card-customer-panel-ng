import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { Editor, Toolbar } from 'ngx-editor';
import { NgxEditorModule } from 'ngx-editor';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { ModalService } from 'src/app/core/utilities/modal';
import { WebsiteBuilderService } from 'src/app/services/website-builder.service';

@Component({
  selector: 'app-our-team',
  templateUrl: './our-team.component.html',
  styleUrl: './our-team.component.scss',
})
export class OurTeamComponent implements OnInit, OnDestroy {
  imageURL = environment.imageURL;
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;

  members: any[] = [];
  filteredMembers: any[] = [];
  memberId: string = '';
  selectedImage: string = '';

  // ngx-editor instances
  addNameEditor!: Editor; // For name in add modal
  addRoleEditor!: Editor; // For role in add modal
  editNameEditor!: Editor; // For name in edit modal
  editRoleEditor!: Editor; // For role in edit modal

  // Editor toolbar configuration
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

  newMember: any = {
    name: '',
    role: '',
    photo: null as File | null,
    visible: true,
  };

  editingMember = {
    _id: '',
    name: '',
    role: '',
    photo: null as File | null,
    currentPhoto: '',
    visible: true,
  };

  constructor(
    private storage: AppStorage,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    public modal: ModalService,
    private websiteService: WebsiteBuilderService,
    private sanitizer: DomSanitizer
  ) {}

  businessCardId: any;

  async ngOnInit() {
    // Initialize editors
    this.addNameEditor = new Editor();
    this.addRoleEditor = new Editor();
    this.editNameEditor = new Editor();
    this.editRoleEditor = new Editor();
    this.businessCardId = this.storage.get(common.BUSINESS_CARD);
    await this.fetchTeamMembers();
  }

  ngOnDestroy(): void {
    // Destroy editors to prevent memory leaks
    this.addNameEditor.destroy();
    this.addRoleEditor.destroy();
    this.editNameEditor.destroy();
    this.editRoleEditor.destroy();
  }

  async fetchTeamMembers() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      let results = await this.authService.getWebsiteDetails(businessCardId);
      if (results) {
        this.members = results.teams ? [...results.teams] : [];
        this.filteredMembers = [...this.members];
        this.totalItems = this.members.length;
        this.teamVisible = results.teamVisible;
        this.cdr.markForCheck();
      } else {
        swalHelper.showToast('Failed to fetch team members!', 'warning');
      }
    } catch (error) {
      console.error('Error fetching team members: ', error);
      swalHelper.showToast('Error fetching team members!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  async addTeamMember() {
    if (!this.validateMember(this.newMember)) {
      return;
    }

    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      const formData = new FormData();
      formData.append('businessCardId', businessCardId);
      formData.append('name', this.newMember.name);
      formData.append('role', this.newMember.role || '');
      formData.append('visible', this.newMember.visible.toString());
      if (this.newMember.photo) {
        formData.append('file', this.newMember.photo);
      }

      const result = await this.authService.addTeams(formData);
      if (result) {
        this.members = [result, ...this.members];
        this.filteredMembers = [...this.members];
        this.totalItems = this.members.length;

        await this.fetchTeamMembers();
        this.resetForm();
        this.modal.close('AddTeamMemberModal');
        swalHelper.showToast('Team member added successfully!', 'success');
      }
    } catch (error) {
      console.error('Error adding team member: ', error);
      swalHelper.showToast('Error adding team member!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  onFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.newMember.photo = event.target.files[0];
    }
  }

  onEditFileChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.editingMember.photo = event.target.files[0];
    }
  }

  editMember(member: any) {
    this.editingMember = {
      _id: member._id,
      name: member.name,
      role: member.role || '',
      photo: null,
      currentPhoto: member.photo || '',
      visible: member.visible,
    };
    this.modal.open('EditTeamMemberModal');
    this.cdr.markForCheck();
  }

  async updateTeamMember() {
    if (!this.validateMember(this.editingMember)) {
      return;
    }

    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      const formData = new FormData();
      formData.append('businessCardId', businessCardId);
      formData.append('teamId', this.editingMember._id);
      formData.append('name', this.editingMember.name);
      formData.append('role', this.editingMember.role || '');
      formData.append('visible', this.editingMember.visible.toString());
      if (this.editingMember.photo) {
        formData.append('file', this.editingMember.photo);
      }

      const result = await this.authService.updateTeams(formData);
      if (result) {
        const index = this.members.findIndex(m => m._id === this.editingMember._id);
        if (index !== -1) {
          this.members[index] = result;
          this.filteredMembers = [...this.members];
        }
        await this.fetchTeamMembers();
        this.modal.close('EditTeamMemberModal');
        swalHelper.showToast('Team member updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating team member: ', error);
      swalHelper.showToast('Error updating team member!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  prepareDeleteMember = async (memberId: string) => {
    this.memberId = memberId;
    this.cdr.markForCheck();
    const confirm = await swalHelper.delete();
    if (confirm.isConfirmed) {
      this.confirmDeleteMember();
    }
  };

  async confirmDeleteMember() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      const data = {
        businessCardId: businessCardId,
        teamId: this.memberId,
      };

      const result = await this.authService.deleteTeams(data);

      if (result) {
        this.members = this.members.filter(m => m._id !== this.memberId);
        this.filteredMembers = [...this.members];
        this.totalItems = this.members.length;
        await this.fetchTeamMembers();
        swalHelper.success('Team member deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting team member: ', error);
      swalHelper.showToast('Error deleting team member!', 'error');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  validateMember(member: any): boolean {
    const strippedName = this.stripHtml(member.name).trim();
    if (!strippedName) {
      swalHelper.showToast('Team member name is required!', 'warning');
      return false;
    }
    return true;
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredMembers = [...this.members];
    } else {
      this.filteredMembers = this.members.filter(member =>
        this.stripHtml(member.name).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (member.role && this.stripHtml(member.role).toLowerCase().includes(this.searchTerm.toLowerCase()))
      );
    }
    this.totalItems = this.filteredMembers.length;
    this.cdr.markForCheck();
  }

  onItemsPerPageChange() {
    this.p = 1;
    this.cdr.markForCheck();
  }

  pageChangeEvent(event: number) {
    this.p = event;
    this.cdr.markForCheck();
  }

  resetForm() {
    this.newMember = { name: '', role: '', photo: null, visible: true };
    this.cdr.markForCheck();
  }

  onCloseEditMemberModal() {
    this.modal.close('EditTeamMemberModal');
  }

  teamVisible: boolean = false;

  _updateVisibility = async () => {
    await this.websiteService.updateVisibility({
      teamVisible: this.teamVisible,
      businessCardId: this.businessCardId,
    });
  };



  sanitizeHtml(content: any): any {
    if (!content) return '';
    return content.replace(/<[^>]*>/g, '');
  }

  // Helper method to strip HTML tags for validation and search
  stripHtml(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}