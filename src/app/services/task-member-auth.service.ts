import { AiassistantComponent } from './../views/partials/task-managemnt/common-components/aiassistant/aiassistant.component';
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
  memberDetails: any;

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

  async getTeamMemberProfile(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.TEAM_MEMBER_PROFILE,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != null) {
        return response.data;
      } else {
        swalHelper.showToast(response.message, 'warning');
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return null;
    }
  }

   async UpdateTeamMember(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.UPDATE_TEAM_MEMBER,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != 0) {
        swalHelper.success(response.message);
        return true;
      } else {
        swalHelper.showToast(response.message, 'warning');
        return false;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }



  async ChangeMemberPassword(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.CHANGE_MEMBER_PASSWORD,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != 0) {
        swalHelper.success(response.message);
        return true;
      } else {
        swalHelper.showToast(response.message, 'warning');
        return false;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }

  // TODO : ADDING THE AI-ASSISTENET SERVICE
  async Aiassistant(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.AI_ASSISTANT,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != 0) {
        swalHelper.success(response.message);
        return true;
      } else {
        swalHelper.showToast(response.message, 'warning');
        return false;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }


}