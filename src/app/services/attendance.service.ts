import { Injectable } from '@angular/core';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { swalHelper } from '../core/constants/swal-helper';
import { common } from '../core/constants/common';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private headers: any = [];
  constructor(private apiManager: ApiManager, private storage: AppStorage) {}

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token != null) {
      this.headers.push({ 'origin-domain': window.location.origin });
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async addOffice(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.ADD_OFFICE,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != null) {
        swalHelper.showToast(response.message, 'success');
        return true;
      } else {
        swalHelper.warning(response.message);
        return false;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }

  async updateOffice(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.UPDATE_OFFICE,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != null) {
        swalHelper.showToast(response.message, 'success');
        return true;
      } else {
        swalHelper.warning(response.message);
        return false;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }

  async deleteOffice(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.DELETE_OFFICE,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != null) {
        swalHelper.showToast(response.message, 'success');
        return true;
      } else {
        swalHelper.warning(response.message);
        return false;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }

  async getOffices(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        { url: apiEndpoints.GET_OFFICES, method: 'POST' },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != null) {
        return response.data;
      } else {
        swalHelper.warning(response.message);
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return null;
    }
  }
  
  async getEmployees(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        { url: apiEndpoints.GET_EMPLOYEES, method: 'POST' },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != null) {
        return response.data;
      } else {
        swalHelper.warning(response.message);
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return null;
    }
  }

  async createEmployee(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        { url: apiEndpoints.ADD_EMPLOYEE, method: 'POST' },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != null) {
        return response.data;
      } else {
        swalHelper.warning(response.message);
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return null;
    }
  }

  async updateEmployee(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        { url: apiEndpoints.UPDATE_EMPLOYEE, method: 'POST' },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != null) {
        return response.data;
      } else {
        swalHelper.warning(response.message);
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return null;
    }
  }

  async deleteEmployee(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        { url: apiEndpoints.DELETE_EMPLOYEE, method: 'POST' },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != null) {
        return response.data;
      } else {
        swalHelper.warning(response.message);
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return null;
    }
  }

  getAttendanceList = async (data: any) => {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        { url: apiEndpoints.GET_ATTENDANCE_LIST, method: 'POST' },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != null) {
        return response.data;
      } else {
        swalHelper.warning(response.message);
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return null;
    }
  }

  getAttendanceStats = async (data: any) => {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        { url: apiEndpoints.GET_ATTENDANCE_STATS, method: 'POST' },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != null) {
        return response.data;
      } else {
        swalHelper.warning(response.message);
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return null;
    }
  }

  sendNotification = async (data: any) => {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        { url: apiEndpoints.SEND_NOTIFICATION, method: 'POST' },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != null) {
        swalHelper.showToast(response.message, 'success');
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
