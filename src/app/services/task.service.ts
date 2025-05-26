import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { swalHelper } from '../core/constants/swal-helper';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

   private headers: any = [];
    constructor(private apiManager: ApiManager, private storage: AppStorage) { }
  
    private getHeaders = () => {
      this.headers = [];
      let token = this.storage.get(common.TOKEN);
      if (token != null) {
        this.headers.push({ Authorization: `Bearer ${token}` });
      }
    };


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

    async UpdateTeamMember(data: any) {
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.UPDATE_TEAM_MEMBER,
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

    async ChangePasswordInTask(data: any) {
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.CHANGE_PASSWORD_INTASK,
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

    async UpdateBoardCategories(data: any) {
      try {
        this.getHeaders();
        let response = await this.apiManager.request(
          {
            url: apiEndpoints. UPDATE_BOARD_CATEGORIES,
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
