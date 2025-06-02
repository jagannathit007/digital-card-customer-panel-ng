import { Injectable } from '@angular/core';
import { swalHelper } from '../core/constants/swal-helper';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { teamMemberCommon } from '../core/constants/team-members-common';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskMemberAuthService {
  private headers: any = [];
  profileData: any;

  constructor(private apiManager: ApiManager, private storage: AppStorage) {}

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(teamMemberCommon.TEAM_MEMBER_TOKEN);
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async teamMemberSignin(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.TEAM_MEMBER_SIGNIN,
          method: 'POST'
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data != null) {
        this.storage.clearAll();
        this.storage.set(teamMemberCommon.TEAM_MEMBER_TOKEN, response.data.token); 
        this.storage.set(teamMemberCommon.TEAM_MEMBER_DATA, response.data.user);
        if (response.data.taskUserToken){
          this.storage.set(teamMemberCommon.TOKEN, response.data.taskUserToken);
        }
        return response;
      } else {
        swalHelper.showToast(response.message || 'Login failed', 'warning');
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return null;
    }
  }

  async verifyToken(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.TEAM_MEMBER_VERIFY_TOKEN,
          method: 'POST'
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data != null) {
        return response;
      } else {
        swalHelper.showToast(response.message || 'Invalid token', 'warning');
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return null;
    }
  }
}