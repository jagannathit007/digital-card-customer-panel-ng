// src/app/services/crm.service.ts
import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { teamMemberCommon } from '../core/constants/team-members-common';
import { swalHelper } from '../core/constants/swal-helper';
import { environment } from 'src/env/env.local';
import { common } from '../core/constants/common';

@Injectable({
  providedIn: 'root',
})
export class CrmService {
  private headers: any = [];

  private app = this.storage.get(common.APP);
  private baseURL = `${this.app?.domain?.backendLink || ''}/${environment.route}/crm`;
  constructor(private apiManager: ApiManager, private storage: AppStorage) {}

  private getHeaders() {
    this.headers = [];
    const token = this.storage.get(teamMemberCommon.TEAM_MEMBER_TOKEN);
    if (token) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  }

  async getCrmDetails(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/get-details`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async updateCrmMembers(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/members/update`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async updateCrmCategories(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/categories/update`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async getCrmColumns(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/column/get-all`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async createCrmColumn(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/column/create`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async updateCrmColumnName(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/column/name/update`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async deleteCrmColumn(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/column/delete`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async reorderCrmColumn(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/column/reorder`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async addLead(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/lead/add`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async createCompleteLead(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/lead/create`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async getLeadsByCrmId(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/lead/get-all`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async getLeadById(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/lead/get-details`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async updateLeadTitle(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/lead/update/title`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async updateLeadDescription(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/lead/update/description`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async updateLeadAssignment(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/lead/update/assignment`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async updateLeadCategory(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/lead/update/category`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async updateLeadPriority(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/lead/update/priority`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async updateLeadClosingDate(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/lead/update/closing-date`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async updateLeadContactDetails(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/lead/update/contact-details`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async updateLeadAmount(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/lead/update/amount`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async updateLeadProduct(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/lead/update/product`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async reorderLead(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/lead/reorder`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async getAttachments(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/attachment/get`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async addAttachment(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/attachment/add`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async updateAttachmentFileName(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/attachment/file-name/update`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async deleteAttachment(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/attachment/delete`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async getSelectableTeamMembers(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/team-members/get-all`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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

  async getCrmCategories(data: any) {
    try {
      this.getHeaders();
      const response = await this.apiManager.request(
        {
          url: `${this.baseURL}/categories/get-all`,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status === 200 && response.data) {
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
}