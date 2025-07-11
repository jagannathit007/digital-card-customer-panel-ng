import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { swalHelper } from '../core/constants/swal-helper';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { teamMemberCommon } from '../core/constants/team-members-common';

@Injectable({
  providedIn: 'root',
})
export class PersonalTaskService {
  private headers: any = [];

  constructor(private apiManager: ApiManager, private storage: AppStorage) {}

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(teamMemberCommon.TEAM_MEMBER_TOKEN);
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async AddPersonalTask(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.ADD_PERSONAL_TASK,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message, 'warning');
        return false;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }

  async UpdatePersonalTask(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.UPDATE_PERSONAL_TASK,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message, 'warning');
        return false;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }

  async DeletePersonalTask(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.DELETE_PERSONAL_TASK,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message, 'warning');
        return false;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }

  async TogglePersonalTaskStatus(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.TOGGLE_PERSONAL_TASK_STATUS,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message, 'warning');
        return false;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }

  async getPersonalAllTodayTaskDetails(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_PERSONAL_ALL_TODAY_TASK_DETAILS,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message, 'warning');
        return false;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }

  async getAllTasksWithoutDueDate(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_ALL_TASKS_WITHOUT_DUE_DATE,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message, 'warning');
        return false;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }
  async getPersonalTaskDetails(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_PERSONAL_TASK_DETAILS,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message, 'warning');
        return false;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }

  async getPersonalWeekTaskDetails() {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_WEEK_TASK_DETAILS,
          method: 'POST',
        },
        {},
        this.headers
      );
      if (response.status == 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message, 'warning');
        return false;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }

  async getPersonalTaskStats(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_PERSONAL_TASK_STATS,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message, 'warning');
        return false;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }

  async getPersonalTaskDetailsCount() {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_PERSONAL_TASK_DETAILS_COUNT,
          method: 'POST',
        },
        {},
        this.headers
      );
      if (response.status == 200 && response.data) {
        return response.data;
      } else {
        swalHelper.showToast(response.message, 'warning');
        return false;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }
  async GoogleInitiate() {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_GOOGLE_INITIATE,
          method: 'GET',
        },
        {},
        this.headers
      );
      
      if (response.status == 200 && response.data) {
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

   async getGoogleCalendarId() {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_GOOGLE_CALENDAR_ID,
          method: 'GET',
        },
        {},
        this.headers
      );
      console.log(response);
      if (response.status == 200 && response.data) {
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

}
