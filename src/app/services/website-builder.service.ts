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

    // Catogery wise product services CRUD
    async addOrUpdateCategory(data: any) {
      try {
        this.getHeaders();
        // console.log("catogrey craete",data);
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.ADD_OR_UPDATE_CATEGORY,
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
    async addOrUpdateProductInCategory(data: any) {
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.ADD_OR_UPDATE_PRODUCT_INCATEGORY,
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
    async deleteProductInCategory(data: any) {
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.DELETE_PRODUCT_INCATEGORY,
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
    async deleteCategory(data: any) {
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.DELETE_CATEGORY,
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

    async deleteAboutData(data:any){
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.DELETE_ABOUT_DATA,
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

    // WebsiteBuilder Our Certificate Services
    async updateOurCertificates(data: any) {
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.WEBSITE_CERTIFICATES_ADD,
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

    async deleteProductEnquiry(data:any){
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.DELETE_PRODUCT_ENQUIRY,
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

    async deleteContactEnquiry(data:any){
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.DELETE_CONTACT_ENQUIRY,
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

    // WebsiteBuilder GetAll Themes
    async GetAllWebsiteThemes(){
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          // change it...
          {
            url: apiEndpoints.GETALL_WEBSITE_THEMES,
            method: 'POST'
          },
          {},
          this.headers
        );
        if (response.status === 200 && response.data != null) {
          return response.data;
        } else {
          swalHelper.showToast(response.message || 'Failed to fetch themes.', 'warning');
          return null;
        }
      } catch (err) {
        swalHelper.showToast('Error fetching themes!', 'error');
        return null;
      }
    }
    
    // WebsiteBuilder Update Themes 
    async UpdateWebsiteThemes(data:any){
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.WEBSITE_THEMES_UPDATE,
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

    // WebsiteBuilder Uniquename Checking
    async CheckUniqueWebsiteName(data: any) {
      try {
        this.getHeaders();
        let response= await this.apiManager.request(
          {
            url: apiEndpoints.WEBSITE_UNIQUE_NAME,
            method: 'POST',
          },
          data,
          this.headers
        );
        return response
      } catch (err) {
        console.log(err);
        swalHelper.showToast('Something went wrong!', 'error');
        return null;
      }
    }

    // WebsiteBuilder name Saving
    async WebsiteNameSaving(data: any) {
      try {
        this.getHeaders();
        let response= await this.apiManager.request(
          {
            url: apiEndpoints.WEBSITE_NAME_SAVING,
            method: 'POST',
          },
          data,
          this.headers
        );
        return response
      } catch (err) {
        console.log(err);
        swalHelper.showToast('Something went wrong!', 'error');
        return null;
      }
    }

    async updateFaq(data: any) {
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.WEBSITE_FAQ_ADD,
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

    async deleteFaq(data:any){
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.WEBSITE_FAQ_DELETE,
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

    async updateBlogs(data: any) {
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.WEBSITE_BLOGS_ADD,
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

    async deleteBlogs(data:any){
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.WEBSITE_BLOGS_DELETE,
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

}