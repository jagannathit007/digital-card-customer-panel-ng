import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { swalHelper } from '../core/constants/swal-helper';
import { teamMemberCommon } from '../core/constants/team-members-common';

@Injectable({
  providedIn: 'root',
})
export class TaskPermissionsService {
  constructor(private apiManager: ApiManager, private storage: AppStorage) {}
  private adminLevelRoles = ['admin'];
  private managementLevelRoles = ['admin', 'editor'];
  private boardLevelRoles = ['admin', 'editor', 'manager'];
  private taskLevelRoles = ['admin', 'editor', 'manager', 'leader'];
  private memberLevelRoles = ['admin', 'editor', 'manager', 'leader', 'member'];

  private rolesHierarchy: any = {
    admin: 5,
    editor: 4,
    manager: 3,
    leader: 2,
    member: 1,
  };

  private getCurrentUser = () => {
    let taskMemberDetails = this.storage.get(teamMemberCommon.TEAM_MEMBER_DATA);
    return taskMemberDetails ? taskMemberDetails : null;
  };

  isAdminLevelPermission() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return false;
      }
      const userRole = currentUser.role || '';
      if (this.adminLevelRoles.includes(userRole)) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      swalHelper.showToast(
        'Something went wrong while checking permissions!',
        'error'
      );
      return false;
    }
  }

  isManagementLevelPermission() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return false;
      }
      const userRole = currentUser.role || '';
      if (this.managementLevelRoles.includes(userRole)) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      swalHelper.showToast(
        'Something went wrong while checking permissions!',
        'error'
      );
      return false;
    }
  }

  isBoardLevelPermission() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return false;
      }
      const userRole = currentUser.role || '';
      if (this.boardLevelRoles.includes(userRole)) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      swalHelper.showToast(
        'Something went wrong while checking permissions!',
        'error'
      );
      return false;
    }
  }

  isTaskLevelPermission() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return false;
      }
      const userRole = currentUser.role || '';
      if (this.taskLevelRoles.includes(userRole)) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      swalHelper.showToast(
        'Something went wrong while checking permissions!',
        'error'
      );
      return false;
    }
  }

  isMemberLevelPermission() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        return false;
      }
      const userRole = currentUser.role || '';
      if (this.memberLevelRoles.includes(userRole)) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      swalHelper.showToast(
        'Something went wrong while checking permissions!',
        'error'
      );
      return false;
    }
  }

  isRoleHigherOrEqual(targetRole: string): boolean {
    try {
      if (!targetRole || !this.rolesHierarchy[targetRole]) {
        return false;
      }

      const currentUser = this.getCurrentUser();
      if (!currentUser || !this.rolesHierarchy[currentUser.role]) {
        return false;
      }

      const targetRank = this.rolesHierarchy[targetRole];
      const currentRank = this.rolesHierarchy[currentUser.role];

      // current user must have a lower or equal number (higher rank)
      return currentRank <= targetRank;
    } catch (err) {
      swalHelper.showToast(
        'Something went wrong while checking permissions!',
        'error'
      );
      return false;
    }
  }

  getRoleRank(role: string): number {
    try {
      if (!role || !this.rolesHierarchy[role]) {
        return 0; // Return 0 for undefined or unknown roles
      }
      return this.rolesHierarchy[role];
    } catch (err) {
      swalHelper.showToast(
        'Something went wrong while getting role rank!',
        'error'
      );
      return 0;
    }
  }
}
