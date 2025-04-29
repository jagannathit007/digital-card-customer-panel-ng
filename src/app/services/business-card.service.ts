import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { common } from '../core/constants/common';
import { swalHelper } from '../core/constants/swal-helper';
import { apiEndpoints } from '../core/constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class BusinessCardService {

  private headers: any = [];
    constructor(private apiManager: ApiManager, private storage: AppStorage) {}
  
    private getHeaders = () => {
      this.headers = [];
      let token = this.storage.get(common.TOKEN);
      if (token != null) {
        this.headers.push({ Authorization: `Bearer ${token}` });
      }
    };
  
    async getServices(data: any) {
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.GET_BUSINESS_CARD_SERVICES,
            method: 'POST',
          },
          data,
          this.headers
        );
        if (response.data && response.data!= null) {
          return response.data;
        } else {
          swalHelper.showToast(response.message, 'warning');
          return null;
        }
      } catch (err) {
        console.log(err);
        swalHelper.showToast('Something went wrong!', 'error');
        return null;
      }
    }

    async createServices(data: any) {
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.CREATE_BUSINESS_CARD_SERVICES,
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

    async deleteServices(data: any) {
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.DELETE_BUSINESS_CARD_SERVICES,
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

    async getProducts(data: any) {
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.GET_BUSINESS_CARD_PRODUCTS,
            method: 'POST',
          },
          data,
          this.headers
        );
        if (response.data && response.data!= null) {
          return response.data;
        } else {
          swalHelper.showToast(response.message, 'warning');
          return null;
        }
      } catch (err) {
        console.log(err);
        swalHelper.showToast('Something went wrong!', 'error');
        return null;
      }
    }

    async createProducts(data: any) {
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.CREATE_BUSINESS_CARD_PRODUCTS,
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
            url: apiEndpoints.DELETE_BUSINESS_CARD_PRODUCTS,
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


    async getOffers(data: any) {
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.GET_BUSINESS_CARD_OFFERS,
            method: 'POST',
          },
          data,
          this.headers
        );
        if (response.data && response.data != null) {
          return response.data;
        } else {
          swalHelper.showToast(response.message, 'warning');
          return null;
        }
      } catch (err) {
        console.log(err);
        swalHelper.showToast('Something went wrong!', 'error');
        return null;
      }
    }
    
    async createOffer(data: any) {
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.UPDATE_BUSINESS_CARD_OFFERS,
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
    
    async deleteOffer(data: any) {
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.DELETE_BUSINESS_CARD_OFFERS,
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

async updateVisibility(data: any) {
  try {
    this.getHeaders();
    let response = await this.apiManager.request(
      {
        url: apiEndpoints.UPDATE_BUSINESSCARD_VISIBILITY,
        method: 'POST',
      },
      data,
      this.headers
    );
    if (response.status == 200 && response.data != 0) {
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


async getContactRequest(data: any) {
  try {
    this.getHeaders();
    let response = await this.apiManager.request(
      {
        url: apiEndpoints.GET_CONTACT_REQUEST,
        method: 'POST',
      },
      data,
      this.headers
    );
    if (response.data && response.data != null) {
      return response.data;
    } else {
      swalHelper.showToast(response.message, 'warning');
      return null;
    }
  } catch (err) {
    console.log(err);
    swalHelper.showToast('Something went wrong!', 'error');
    return null;
  }
}

async deleteContactRequest(data: any) {
  try {
    this.getHeaders();
    let response = await this.apiManager.request(
      {
        url: apiEndpoints.DELETE_CONTACT_REQUEST,
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
