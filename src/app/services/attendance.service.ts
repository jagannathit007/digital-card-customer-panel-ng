import { Injectable } from '@angular/core';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { swalHelper } from '../core/constants/swal-helper';
import { common } from '../core/constants/common';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private headers: any = [];
  constructor(private apiManager: ApiManager, private storage: AppStorage, private http: HttpClient) {}

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

  getCustomFields = async (data: any) => {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        { url: apiEndpoints.GET_CUSTOM_FIELDS, method: 'POST' },
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

  async generateAttendanceReport(
    data: { officeId: string; month: string; employeeId?: string }
  ): Promise<Blob | null> {
    try {
      this.getHeaders();

      // Convert your headers array to HttpHeaders
      let headerObj: any = {};
      this.headers.forEach((h: any) => {
        Object.keys(h).forEach((key) => (headerObj[key] = h[key]));
      });
      const httpHeaders = new HttpHeaders(headerObj);

      // 👇 Direct API call with responseType: 'blob'
      const response = await this.http
        .post(apiEndpoints.GENERATE_ATTENDANCE_REPORT, data, {
          headers: httpHeaders,
          responseType: 'blob',
        })
        .toPromise();

      if (response) {
        return response;
      } else {
        swalHelper.warning('Failed to generate report');
        return null;
      }
    } catch (err) {
      console.error('Error in generateAttendanceReport:', err);
      swalHelper.showToast('Something went wrong!', 'error');
      return null;
    }
  }

  async getLeaves(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        { url: apiEndpoints.GET_LEAVES, method: 'POST' },
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

  async manageLeave(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        { url: apiEndpoints.MANAGE_LEAVE, method: 'POST' },
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
