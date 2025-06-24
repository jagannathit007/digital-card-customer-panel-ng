import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { swalHelper } from '../core/constants/swal-helper';
import { teamMemberCommon } from '../core/constants/team-members-common';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private headers: any = [];
  constructor(private apiManager: ApiManager, private storage: AppStorage) { }

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(teamMemberCommon.TEAM_MEMBER_TOKEN);
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  async GetAllMembers(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_ALL_MEMBERS,
          method: 'POST',
        },
        data,
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


  async GetSelectableTeamMembers(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_ALL_SELECTABLE_TEAMMEMBERS,
          method: 'POST',
        },
        data,
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

  async AddTeamMember(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.ADD_TEAM_MEMBER,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
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

  async ReinviteUser(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.REINVITE_USER,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
        // swalHelper.success(response.message);
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

  async DeleteTeamMember(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.DELETE_TEAM_MEMBER,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
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


  async ChangeRole(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.CHANGE_ROLE,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
        swalHelper.success(response.message);
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

  async toggleMemberStatus(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.TOGGLE_MEMBER_STATUS,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
        swalHelper.success(response.message);
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

  async CreateBoard(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.CREATE_BOARD,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
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

  async UpdateBoard(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.UPDATE_BOARD,
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

  async DeleteBoard(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.DELETE_BOARD,
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

  async UpdateBoardMembers(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.UPDATE_BOARD_MEMBERS,
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

  async UpdateBoardCategories(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.UPDATE_BOARD_CATEGORIES,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
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

  async GetBoardNames(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_BOARDS_NAMES,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
        return response.data;
      } else {
        // swalHelper.showToast(response.message, 'warning');
        return false;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }
  async GetBoardByAdmin(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_BOARDS_FOR_ADMIN,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
        return response.data;
      } else {
        // swalHelper.showToast(response.message, 'warning');
        return false;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }

  async GetJoinedBoards(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_JOINED_BOARDS,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data) {
        return response.data;
      } else {
        // swalHelper.showToast(response.message, 'warning');
        return false;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return false;
    }
  }

  async GetAllAvailableMembers(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_ALL_AVAILABLE_MEMBERS,
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

  async createNewBoard(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.CREATE_BOARD,
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
  
  async AddComment(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.ADD_COMMENT,
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

  async getBoardDetails(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_BOARD_DETAILS,
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

  async getBoardsAllTasks(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_BOARD_TASKS,
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

  async reorderBoardTasks(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.REORDER_BOARD_TASKS,
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

  async AddTeamTask(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.ADD_NEW_TEAM_TASK,
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
}
