import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { swalHelper } from '../core/constants/swal-helper';

@Injectable({
  providedIn: 'root'
})
export class ShareHistoryService {

  private headers: any = [];
  constructor(private apiManager: ApiManager, private storage: AppStorage) { }

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token != null) {
      this.headers.push({ "origin-domain": window.location.origin });
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };


  async getSharedHistory(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.SHARED_HISTORY,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != 0) {
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

  async getSharedKeyword(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.SHARED_KEYWORDS,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != 0) {
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

  async downloadExcel(data: any) {
    try {
      this.getHeaders();

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', apiEndpoints.SHARED_DOWNLOADEXCEL, true);

        // Set headers including authorization
        const token = this.storage.get(common.TOKEN);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('Content-Type', 'application/json');

        // Set response type to blob
        xhr.responseType = 'blob';

        xhr.onload = function () {
          if (xhr.status === 200) {
            const blob = new Blob([xhr.response], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            // Create download link and trigger click
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `contacts-${data.businessCardId}.xlsx`;
            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            resolve(true);
          } else {
            swalHelper.showToast('Failed to download file', 'error');
            reject(new Error('Failed to download file'));
          }
        };

        xhr.onerror = function () {
          swalHelper.showToast('Network error occurred', 'error');
          reject(new Error('Network error'));
        };

        xhr.send(JSON.stringify(data));
      });
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return null;
    }
  }


}


