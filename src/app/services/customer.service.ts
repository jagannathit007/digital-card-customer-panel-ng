import { Injectable } from '@angular/core';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { swalHelper } from '../core/constants/swal-helper';
import { common } from '../core/constants/common';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private headers: any = [];
  constructor(private apiManager: ApiManager, private storage: AppStorage) { }

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async addCustomer(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.ADD_CUSTOMER,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != 0 && response.data!=null) {
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

  async getCustomer(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_CUSTOMER,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != 0) {
        // swalHelper.showToast(response.message, 'success');
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

  async deletCustomer(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.DELETE_CUSTOMER,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != 0) {
        swalHelper.success(response.message);
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

  async saveExcelCustomer(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.SAVE_EXCEL_CUSTOMER,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != 0) {
        swalHelper.success(response.message);
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
}
