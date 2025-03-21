import { Injectable } from '@angular/core';
import { swalHelper } from '../core/constants/swal-helper';
import { apiEndpoints } from '../core/constants/api-endpoints';
import { common } from '../core/constants/common';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private headers: any = [];

  profileData: any;
  selectedBusinessCard: String = '';
  businessCards$: Observable<any[]> = of([]);
  constructor(private apiManager: ApiManager, private storage: AppStorage) { }

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token != null) {
      this.headers.push({ Authorization: `Bearer ${token}` });
    }
  };

  private addBusinessCardId(data: any) {
    let businessCardId = this.storage.get(common.BUSINESS_CARD);
    if (businessCardId != null) {
      data.businessCardId = businessCardId;
    }
    return data;
  }

  async getBusinessCards() {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        { url: apiEndpoints.BUSINESS_CARDS, method: 'POST' },
        {},
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

  async signIn(data: any) {
    try {
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.SIGN_IN,
          method: 'POST',
        },
        data,
        this.headers
      );
      if (response.status == 200 && response.data != null) {
        this.storage.clearAll();
        this.storage.set(common.TOKEN, response.data);
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

  async getProfile(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_PROFILE,
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

  async updateProfile(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.UPDATE_PROFILE,
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

  async updatePersonalDetails(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); // Adding businessCardId here

      let response = await this.apiManager.request(
        {
          url: apiEndpoints.PERSONAL_DETAILS,
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

  async updateGalleryDetails(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); // Adding businessCardId here

      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GALLERY_DETAILS,
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

  async getGalleryDetails(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data);

      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_GALLERY,
          method: 'POST',
        },
        data,
        this.headers
      );

      if (response.status == 200 && response.data != null) {
        return response.data;
      } else {
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Something went wrong!', 'error');
      return null;
    }
  }

  async deleteGalleryDetails(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data);

      let response = await this.apiManager.request(
        {
          url: apiEndpoints.DELETE_GALLERY,
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

  async updateBusinessSocialDetails(data: any) {
    try {
      this.getHeaders();

      let response = await this.apiManager.request(
        {
          url: apiEndpoints.ADD_SOCIAL_MEDIA_LINK,
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

  async updateBusinessDetails(data: any) {
    try {
      this.getHeaders();

      let response = await this.apiManager.request(
        {
          url: apiEndpoints.BUSINESS_DETAILS,
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

  async updateDocumentDetails(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); // Adding businessCardId here

      let response = await this.apiManager.request(
        {
          url: apiEndpoints.DOCUMENT_DETAILS,
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

  async changePassword(data: any) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.CHANGE_PASSWORD,
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

  async getScannedCards(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); // Adding businessCardId here
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.SCANNED_CARDS,
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

  async updateScannedCard(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); // Adding businessCardId here
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.UPDATE_SCANNED_CARDS,
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

  async deleteScannedCard(data: any) {
    try {
      this.getHeaders();
      let request = { _id: data };
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.DELETE_SCANNED_CARDS,
          method: 'POST',
        },
        request,
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

  async getKeywords(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); // Adding businessCardId here
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.KEYWORDS,
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

  async getThemes() {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        // change it...
        {
          url: apiEndpoints.THEMES_DETAILS,
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

  async applyTheme(themeId: string) {
    try {
      this.getHeaders();
      const businessCardId = JSON.parse(localStorage.getItem('business_card') || '""');

      // console.log(themeId,businessCardId);
      // console.log(`${apiEndpoints.THEMES_UPDATE}/${businessCardId}`);
      let response = await this.apiManager.request(
        // change it...
        {
          url: `${apiEndpoints.THEMES_UPDATE}/${businessCardId}`,
          method: 'POST'
        },
        { themeId, businessCardId },
        this.headers
      );

      if (response.status === 200 && response.data != null) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to applied themes.', 'warning');
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Error appling themes!', 'error');
      return null;
    }
  }

  // In your auth.service.ts
  async getSubscriptionData(businessCardId: string): Promise<any[]> {
    try {
      const businessCards = await this.getBusinessCards();

      if (!businessCards || !businessCardId) {
        return [];
      }

      // Find the matching business card and extract subscription data
      if (Array.isArray(businessCards)) {
        const targetCard = businessCards.find(card => card._id === businessCardId);

        if (targetCard?.subscription && Array.isArray(targetCard.subscription)) {
          return targetCard.subscription.map((sub: any) => ({
            _id: sub._id,
            product: sub.product
          }));
        }
      }

      return [];
    } catch (error) {
      console.error("Error getting subscription data:", error);
      return [];
    }
  }
}  