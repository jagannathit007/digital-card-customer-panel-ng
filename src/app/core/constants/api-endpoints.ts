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
  public GET_OTHER_DOCUMENTS: string = `${this.PATH}/business-cards/other-documents`;
  public OTHER_DOCUMENT_DETAILS: string = `${this.PATH}/business-cards/other-documents/update`;
  public GALLERY_DETAILS: string = `${this.PATH}/business-cards/gallery/update`;
  public DELETE_GALLERY: string = `${this.PATH}/business-cards/gallery/delete`;
  public THEMES_DETAILS: string = `${this.PATH}/themes`;
  public THEMES_UPDATE: string = `${this.PATH}/themes/update`;
  public GOOGLE_STANDEE_DETAILS: string = `${this.PATH}/review/getReviews`;
  public GET_QR_DETAILS: string = `${this.PATH}/qr-link/get-qr-details`;
  public UPDATE_AI_DETAILS: string = `${this.PATH}/qr-link/update-ai-feature`;

  // all website details modules
  public WEBSITE_BUILDER: string = `${this.PATH}/website/get-details`;

  // testimonials apis
  public WEBSITE_TESTIMONIALS_ADD: string = `${this.PATH}/website/testimonial/add`;
  public WEBSITE_TESTIMONIALS_UPDATE: string = `${this.PATH}/website/testimonial/update`;
  public WEBSITE_TESTIMONIALS_DELETE: string = `${this.PATH}/website/testimonial/delete`;

  // our-clients apis
  public WEBSITE_OUR_CLIENTS_ADD: string = `${this.PATH}/website/client/add`;
  public WEBSITE_OUR_CLIENTS_UPDATE: string = `${this.PATH}/website/client/update`;
  public WEBSITE_OUR_CLIENTS_DELETE: string = `${this.PATH}/website/client/delete`;

  // our-services apis
  public WEBSITE_OUR_SERVICS_ADD: string = `${this.PATH}/website/service/add`;
  public WEBSITE_OUR_SERVICS_UPDATE: string = `${this.PATH}/website/service/update`;
  public WEBSITE_OUR_SERVICS_DELETE: string = `${this.PATH}/website/service/delete`;

  // our-Teams apis
  public WEBSITE_OUR_TEAM_ADD: string = `${this.PATH}/website/team/add`;
  public WEBSITE_OUR_TEAM_UPDATE: string = `${this.PATH}/website/team/update`;
  public WEBSITE_OUR_TEAM_DELETE: string = `${this.PATH}/website/team/delete`;

  // our-Products-apis
  public WEBSITE_OUR_PRODUCTS_ADD: string = `${this.PATH}/website/product/add`;
  public WEBSITE_OUR_PRODUCTS_UPDATE: string = `${this.PATH}/website/product/update`;
  public WEBSITE_OUR_PRODUCTS_DELETE: string = `${this.PATH}/website/product/delete`;

  // website_ABOUT-SECTION_apis
  public WEBSITE_ABOUT_UPDATE: string = `${this.PATH}/website/about/update`;

  // website_ABOUT-SECTION_apis
  public WEBSITE_HOME_UPDATE: string = `${this.PATH}/website/home/update`;

  // website_seo_apis
  public WEBSITE_SEO_UPDATE: string = `${this.PATH}/website/seo/update`;



  public WEBSITE_CONTACT_UPDATE_LINK: string = `${this.PATH}/website/social/update`;
  public WEBSITE_CONTACT_ADD: string = `${this.PATH}/website/contact/add`;
  public WEBSITE_CONTACT_EDIT: string = `${this.PATH}/website/contact/update`;
  public WEBSITE_CONTACT_DELETE: string = `${this.PATH}/website/contact/delete`;

}

export let apiEndpoints = new ApiEndpoints();
