import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { swalHelper } from '../core/constants/swal-helper';

@Injectable({
  providedIn: 'root',
})
export class IdeaBoardService {
  private headers: any = [];

  constructor(private apiManager: ApiManager, private storage: AppStorage) {}

  private getHeaders = () => {
      this.headers = [];
      let token = this.storage.get(common.TOKEN);
      if (token != null) {
        this.headers.push({ "origin-domain": window.location.origin });
        this.headers.push({ Authorization: `Bearer ${token}` });
      }
    };

  // Get all ideas
  async getIdeas(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_IDEAS,
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

  // Add new idea
  async addIdea(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.ADD_IDEA,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
        swalHelper.showToast(response.message, 'success');
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

  // Update idea
  async updateIdea(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.UPDATE_IDEA,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
        swalHelper.showToast(response.message, 'success');
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

  // Delete idea
  async deleteIdea(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.DELETE_IDEA,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
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

  // Get idea categories
  async getIdeaCategories() {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_IDEA_CATEGORIES,
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

  // Add idea category
  async addIdeaCategory(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.ADD_IDEA_CATEGORY,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
        swalHelper.showToast(response.message, 'success');
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

  // Update idea category
  async updateIdeaCategory(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.UPDATE_IDEA_CATEGORY,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
        swalHelper.showToast(response.message, 'success');
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

  // Delete idea category
  async deleteIdeaCategory(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.DELETE_IDEA_CATEGORY,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
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
}
