import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { swalHelper } from '../core/constants/swal-helper';

@Injectable({
  providedIn: 'root'
})
export class WebsiteBuilderService {

  private headers: any = [];
    constructor(private apiManager: ApiManager, private storage: AppStorage) { }
  
    private getHeaders = () => {
      this.headers = [];
      let token = this.storage.get(common.TOKEN);
      if (token != null) {
        this.headers.push({ Authorization: `Bearer ${token}` });
      }
    };
  
  
    async createProducts(data: any) {
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.WEBSITE_OUR_PRODUCTS_UPDATE,
            method: 'POST',
          },
          data,
          this.headers
        );
        if (response.status == 200 && response.data != 0) {
          swalHelper.showToast(response.message, 'success');
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

    async deleteProducts(data: any) {
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.WEBSITE_OUR_PRODUCTS_DELETE,
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

    async updateVisibility(data:any){
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.UPDATE_VISIBILITY,
            method: 'POST',
          },
          data,
          this.headers
        );
        if (response.status == 200 && response.data != 0) {
          swalHelper.showToast(response.message, 'success');
          return true;
        } else {
          swalHelper.showToast(response.message, 'warning');
          return false;
        }
      } catch (error) {
        swalHelper.showToast('Something went wrong!', 'error');
        return false;
      }
    }

    async updateAboutSectionData(data: any) {
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.WEBSITE_ABOUT_UPDATE,
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
}
