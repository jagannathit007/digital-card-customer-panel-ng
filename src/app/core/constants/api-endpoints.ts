import { environment } from '../../../env/env.local';

class ApiEndpoints {
  private PATH: string = `${environment.baseURL}/${environment.route}`;
  public SIGN_IN: string = `${this.PATH}/sign-in`;
  public GET_PROFILE: string = `${this.PATH}/profile`;
  public UPDATE_PROFILE: string = `${this.PATH}/update-profile`;
  public CHANGE_PASSWORD: string = `${this.PATH}/change-password`;
  public BUSINESS_CARDS: string = `${this.PATH}/business-cards`;
  public SCANNED_CARDS: string = `${this.PATH}/scanned-cards`;
  public UPDATE_SCANNED_CARDS: string = `${this.PATH}/scanned-cards/update`;
  public DELETE_SCANNED_CARDS: string = `${this.PATH}/scanned-cards/delete`;
  public GET_GALLERY: string = `${this.PATH}/business-cards/gallery`;
  public KEYWORDS: string = `${this.PATH}/keywords`;

  public PERSONAL_DETAILS: string = `${this.PATH}/business-cards/personal/update`;
  public BUSINESS_DETAILS: string = `${this.PATH}/business-cards/business/update`;
  public ADD_SOCIAL_MEDIA_LINK: string = `${this.PATH}/business-cards/addSocialLink`;
  public DOCUMENT_DETAILS: string = `${this.PATH}/business-cards/documents/update`;
  public GALLERY_DETAILS: string = `${this.PATH}/business-cards/gallery/update`;
  public DELETE_GALLERY: string = `${this.PATH}/business-cards/gallery/delete`;
  public THEMES_DETAILS: string = `${this.PATH}/themes`;
  public THEMES_UPDATE: string = `${this.PATH}/themes/update`;
  public GOOGLE_STANDEE_DETAILS: string = `${this.PATH}/review/getReviews`;
  public GET_QR_DETAILS: string = `${this.PATH}/qr-link/get-qr-details`;
  public UPDATE_AI_DETAILS: string = `${this.PATH}/qr-link/update-ai-feature`;

  public WEBSITE_BUILDER: string = `${this.PATH}/website/get-details`;
  public WEBSITE_CONTACT_UPDATE_LINK: string = `${this.PATH}/website/social/update`;
  public WEBSITE_CONTACT_ADD: string = `${this.PATH}/website/contact/add`;
  public WEBSITE_CONTACT_EDIT: string = `${this.PATH}/website/contact/update`;
  public WEBSITE_CONTACT_DELETE: string = `${this.PATH}/website/contact/delete`;

}

export let apiEndpoints = new ApiEndpoints();
