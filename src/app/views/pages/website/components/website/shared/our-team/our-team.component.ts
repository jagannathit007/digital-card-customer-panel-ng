import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
import { swalHelper } from 'src/app/core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { ModalService } from 'src/app/core/utilities/modal';

@Component({
  selector: 'app-our-team',
  templateUrl: './our-team.component.html',
  styleUrl: './our-team.component.scss',
})
export class OurTeamComponent implements OnInit {
  baseURL = environment.baseURL;
  searchTerm: string = '';
  itemsPerPage: number = 10;
  totalItems: number = 0;
  p: number = 1;
  isLoading: boolean = false;

  members: any[] = [];
  filteredMembers: any[] = [];
  memberId: string = '';
  selectedImage: string = '';

  newMember = {
    name: '',
    role: '',
    photo: null as File | null,
  };

  editingMember = {
    _id: '',
    name: '',
    role: '',
    photo: null as File | null,
    currentPhoto: ''
  };

  constructor(
    private storage: AppStorage, 
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    public modal:ModalService
  ) {}

  async ngOnInit() {
    await this.fetchTeamMembers();
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
      currentPhoto: member.photo || ''
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
        this.modal.close('EditTeamMemberModal')
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

  prepareDeleteMember=async(memberId: string)=>{
    this.memberId = memberId;
    this.cdr.markForCheck();
    const confirm=await swalHelper.delete();
      if(confirm.isConfirmed){
        this.confirmDeleteMember()
      }
  }

  async confirmDeleteMember() {
    this.isLoading = true;
    try {
      let businessCardId = this.storage.get(common.BUSINESS_CARD);
      const data = { 
        businessCardId: businessCardId, 
        teamId: this.memberId 
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
    if (!member.name.trim()) {
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
        member.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (member.role && member.role.toLowerCase().includes(this.searchTerm.toLowerCase()))
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
    this.newMember = { name: '', role: '', photo: null };
    this.cdr.markForCheck();
  }

  onCloseEditMemberModal(){
    this.modal.close('EditTeamMemberModal');
  }
}