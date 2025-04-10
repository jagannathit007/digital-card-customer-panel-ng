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

  async getDocumentsDetail() {
    try {
      this.getHeaders();
      let data = {}
      data = this.addBusinessCardId(data);
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.GET_OTHER_DOCUMENTS,
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

  async updateotherDocuments(otherDocuments: any) {
    try {
      this.getHeaders();
      let data = { otherDocuments }
      data = this.addBusinessCardId(data);

      let response = await this.apiManager.request(
        {
          url: apiEndpoints.OTHER_DOCUMENT_DETAILS,
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
      let response = await this.apiManager.request(
        {
          url: `${apiEndpoints.THEMES_UPDATE}`,
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
  async getReviews(businessCardId: string) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        // change it...
        {
          url: `${apiEndpoints.GOOGLE_STANDEE_DETAILS}/${businessCardId}`,
          method: 'POST'
        },
        {},
        this.headers
      );
      if (response.status === 200 && response.data != null) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to fetch review', 'warning');
        console.log(response.message);
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Error fetching reviews!', 'error');
      return null;
    }
  }
  async getQrdetails(businessCardId: string) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        // change it...
        {
          url: `${apiEndpoints.GET_QR_DETAILS}/${businessCardId}`,
          method: 'POST'
        },
        {},
        this.headers
      );
      if (response.status === 200 && response.data != null) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to fetch Qr Code details!', 'warning');
        console.log(response.message);
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Error fetching Qr Code details!', 'error');
      return null;
    }
  }
  async upadteAiToggle(businessCardId: string, isAIFeatureAllowed: boolean) {
    try {
      // console.log(businessCardId, isAIFeatureAllowed);
      
      this.getHeaders();
      let response = await this.apiManager.request(
        // change it...
        {
          url: `${apiEndpoints.UPDATE_AI_DETAILS}/${businessCardId}`,
          method: 'POST'
        },
        { isAIFeatureAllowed },
        this.headers
      );
      // console.log(response);
      
      if (response.status === 200 && response.data != null) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to fetch Qr Code details!', 'warning');
        console.log(response.message);
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Error fetching Qr Code details!', 'error');
      return null;
    }
  }

  async getWebsiteDetails(businessCardId: string) {
    try {
      this.getHeaders();
      let response = await this.apiManager.request(
        // change it...
        {
          url: `${apiEndpoints.WEBSITE_BUILDER}/${businessCardId}`,
          method: 'POST'
        },
        {},
        this.headers
      );
      if (response.status === 200 && response.data != null) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to fetch website details!', 'warning');
        console.log(response.message);
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Error fetching website details!', 'error');
      return null;
    }
  }

// WEBSITE MODULE ALL SERVICES
  // home section /UPDATE/
  async updateHomeDetails(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); 
      
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.WEBSITE_HOME_UPDATE,
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

  // our-product ADD/UPDATE/DELETE
  async addProducts(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); 
      
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.WEBSITE_OUR_PRODUCTS_ADD,
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
  
  async updateProducts(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); 
      
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.WEBSITE_OUR_PRODUCTS_UPDATE,
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
  
  async deleteProducts(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); 
      
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.WEBSITE_OUR_PRODUCTS_DELETE,
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

   // our-team ADD/UPDATE/DELETE
   async addTeams(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); 
      
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.WEBSITE_OUR_TEAM_ADD,
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
  
  async updateTeams(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); 
      console.log("===",data)
      
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.WEBSITE_OUR_TEAM_UPDATE,
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
  
  async deleteTeams(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); 
      
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.WEBSITE_OUR_TEAM_DELETE,
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

    // our-services ADD/UPDATE/DELETE
    async addServices(data: any) {
      try {
        this.getHeaders();
        data = this.addBusinessCardId(data); 
        
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.WEBSITE_OUR_SERVICS_ADD,
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
    
    async updateServices(data: any) {
      try {
        this.getHeaders();
        data = this.addBusinessCardId(data); 
        
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.WEBSITE_OUR_SERVICS_UPDATE,
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
    
    async deleteServices(data: any) {
      try {
        this.getHeaders();
        data = this.addBusinessCardId(data); 
        
        let response = await this.apiManager.request(
          {
            url: apiEndpoints.WEBSITE_OUR_SERVICS_DELETE,
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
  

      // our-clients ADD/UPDATE/DELETE
  async addClients(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); 
      
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.WEBSITE_OUR_CLIENTS_ADD,
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
  
  async updateClients(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); 
      
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.WEBSITE_OUR_CLIENTS_UPDATE,
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
  
  async deleteClients(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); 
      
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.WEBSITE_OUR_CLIENTS_DELETE,
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

  // about section /UPDATE/
  async updateAboutUs(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); 
      
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

  // testimonials services ADD/UPDATE/DELETE
  async addTestimonials(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); 
      
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.WEBSITE_TESTIMONIALS_ADD,
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
  
  async updateTestimonials(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); 
      
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.WEBSITE_TESTIMONIALS_UPDATE,
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
  
  async deleteTestimonials(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); 
      
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.WEBSITE_TESTIMONIALS_DELETE,
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

  
  // SEO details /UPDATE/
  async updateSeoDetails(data: any) {
    try {
      this.getHeaders();
      data = this.addBusinessCardId(data); 
      let response = await this.apiManager.request(
        {
          url: apiEndpoints.WEBSITE_SEO_UPDATE,
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

  
  // contact details /ADD/UPDATE/DELETE
  async updateSocialLink(businessCardId: string, socialLinks: any) {
    try {
      this.getHeaders();

      let response = await this.apiManager.request(
        // change it...
        {
          url: `${apiEndpoints.WEBSITE_CONTACT_UPDATE_LINK}`,
          method: 'POST'
        },
        { businessCardId, ...socialLinks },
        this.headers
      );
      // console.log(response);
      
      if (response.status === 200 && response.data != null) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to fetch social details!', 'warning');
        console.log(response.message);
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Error fetching social details!', 'error');
      return null;
    }
  }

  async AddContactData(businessCardId: string, data: any) {
    try {
      this.getHeaders();

      let response = await this.apiManager.request(
        // change it...
        {
          url: `${apiEndpoints.WEBSITE_CONTACT_ADD}`,
          method: 'POST'
        },
        { businessCardId, ...data },
        this.headers
      );
      // console.log(response);
      
      if (response.status === 200 && response.data != null) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to Add contact details!', 'warning');
        console.log(response.message);
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Error Add contact details!', 'error');
      return null;
    }
  }

  async updateContactData(businessCardId: string, contactId: string, data: any) {
    try {
      this.getHeaders();

      let response = await this.apiManager.request(
        {
          url: `${apiEndpoints.WEBSITE_CONTACT_EDIT}`,
          method: 'POST'
        },
        { businessCardId, contactId, ...data },
        this.headers
      );
      
      if (response.status === 200 && response.data != null) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to update contact details!', 'warning');
        console.log(response.message);
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Error update contact details!', 'error');
      return null;
    }
  }

  async deleteContactData(businessCardId: string, contactId: string) {
    try {
      this.getHeaders();

      let response = await this.apiManager.request(
     
        {
          url: `${apiEndpoints.WEBSITE_CONTACT_DELETE}`,
          method: 'POST'
        },
        { businessCardId, contactId },
        this.headers
      );

      
      if (response.status === 200 && response.data != null) {
        return response.data;
      } else {
        swalHelper.showToast(response.message || 'Failed to delete contact details!', 'warning');
        console.log(response.message);
        return null;
      }
    } catch (err) {
      swalHelper.showToast('Error delete contact details!', 'error');
      return null;
    }
  }


}  