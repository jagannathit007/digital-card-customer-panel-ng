import { environment } from '../../../env/env.local';
import { AppStorage } from '../utilities/app-storage';
import { common } from './common';

class ApiEndpoints {
  constructor(private storage: AppStorage) {}

  private app = this.storage.get(common.APP);
  // private PATH = this.app.domain?.backendLink+"/web"
  // private PATH = this.app?.domain?.backendLink ? `${this.app.domain.backendLink}/web` : ""
  private baseURL = `${this.app?.domain?.backendLink || ''}`;
  private PATH: string = `${this.baseURL}/${environment.route}`;

  public GET_RAW: string = `${environment.parentDomain}/web/get-raw`;
  public SIGN_IN: string = `${this.PATH}/sign-in`;
  public GET_PROFILE: string = `${this.PATH}/profile`;
  public UPDATE_PROFILE: string = `${this.PATH}/update-profile`;
  public CHANGE_PASSWORD: string = `${this.PATH}/change-password`;
  public BUSINESS_CARDS: string = `${this.PATH}/business-cards`;

  //scanned card
  public SCANNED_CARDS: string = `${this.PATH}/scanned-cards`;
  public UPDATE_SCANNED_CARDS: string = `${this.PATH}/scanned-cards/update`;
  public DELETE_SCANNED_CARDS: string = `${this.PATH}/scanned-cards/delete`;
  public GET_GALLERY: string = `${this.PATH}/business-cards/gallery`;
  public KEYWORDS: string = `${this.PATH}/keywords`;

  public PERSONAL_DETAILS: string = `${this.PATH}/business-cards/personal/update`;
  public BUSINESS_DETAILS: string = `${this.PATH}/business-cards/business/update`;
  public BUSINESS_USERNAME: string = `${this.PATH}/business-cards/business-userName`;

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

  // Category wise services CRUD
  public ADD_OR_UPDATE_SERVICE_CATEGORY: string = `${this.PATH}/website/service/addOrUpdateServiceCategory`;
  public ADD_OR_UPDATE_SERVICE_IN_CATEGORY: string = `${this.PATH}/website/service/addOrUpdateServiceInCategory`;
  public DELETE_SERVICE_IN_CATEGORY: string = `${this.PATH}/website/service/deleteServiceInCategory`;
  public DELETE_SERVICE_CATEGORY: string = `${this.PATH}/website/service/deleteServiceCategory`;

  // "Our Services" outside category
  public WEBSITE_OUR_SERVICES_UPDATE: string = `${this.PATH}/website/service/update`;
  public WEBSITE_OUR_SERVICES_DELETE: string = `${this.PATH}/website/service/delete`;

  // our-Teams apis
  public WEBSITE_OUR_TEAM_ADD: string = `${this.PATH}/website/team/add`;
  public WEBSITE_OUR_TEAM_UPDATE: string = `${this.PATH}/website/team/update`;
  public WEBSITE_OUR_TEAM_DELETE: string = `${this.PATH}/website/team/delete`;

  // our-Products-apis
  // public WEBSITE_OUR_PRODUCTS_ADD: string = `${this.PATH}/website/product/add`;
  public WEBSITE_OUR_PRODUCTS_UPDATE: string = `${this.PATH}/website/product/update`;
  public WEBSITE_OUR_PRODUCTS_DELETE: string = `${this.PATH}/website/product/delete`;
  public UPDATE_VISIBILITY: string = `${this.PATH}/website/update-visibility`;
  public UPDATE_SECTIONS_TITLES: string = `${this.PATH}/website/update-section-titles`;
  // Catogrey wise products CRUD
  public ADD_OR_UPDATE_CATEGORY: string = `${this.PATH}/website/category/addOrUpdateCategory`;
  public ADD_OR_UPDATE_PRODUCT_INCATEGORY: string = `${this.PATH}/website/product/addOrUpdateProductInCategory`;
  public DELETE_PRODUCT_INCATEGORY: string = `${this.PATH}/website/product/deleteProductInCategory`;
  public DELETE_CATEGORY: string = `${this.PATH}/website/category/deleteCategory`;

  // website_ABOUT-SECTION_apis
  public WEBSITE_ABOUT_ADD: string = `${this.PATH}/website/about/add`;
  public WEBSITE_ABOUT_UPDATE: string = `${this.PATH}/website/about/update`;
  public DELETE_ABOUT_DATA: string = `${this.PATH}/website/about/delete`;

  //webiste product enquiry
  public DELETE_PRODUCT_ENQUIRY: string = `${this.PATH}/website/product-enquiry/delete`;
  public DELETE_CONTACT_ENQUIRY: string = `${this.PATH}/website/contact-enquiry/delete`;
  // website_ABOUT-SECTION_apis
  public WEBSITE_HOME_UPDATE: string = `${this.PATH}/website/home/update`;

  // website_seo_apis
  public WEBSITE_SEO_UPDATE: string = `${this.PATH}/website/seo/update`;

  public WEBSITE_CONTACT_UPDATE_LINK: string = `${this.PATH}/website/social/update`;
  public WEBSITE_CONTACT_ADD: string = `${this.PATH}/website/contact/add`;
  public WEBSITE_CONTACT_EDIT: string = `${this.PATH}/website/contact/update`;
  public WEBSITE_CONTACT_DELETE: string = `${this.PATH}/website/contact/delete`;

  // businessCard
  //SERVICES
  public GET_BUSINESS_CARD_SERVICES: string = `${this.PATH}/businessCard/getServices`;
  public CREATE_BUSINESS_CARD_SERVICES: string = `${this.PATH}/businessCard/createServices`;
  public DELETE_BUSINESS_CARD_SERVICES: string = `${this.PATH}/businessCard/deleteServices`;

  // scanned card
  public SAVE_SCANNED_BUSINESS_CARD: string = `${this.PATH}/scanned-cards/save`;
  public EXTRACT_TEXT_FROM_IMAGE: string = `${this.PATH}/scanned-cards/extract-text`;

  // PRODUCT
  public GET_BUSINESS_CARD_PRODUCTS: string = `${this.PATH}/businessCard/getProducts`;
  public CREATE_BUSINESS_CARD_PRODUCTS: string = `${this.PATH}/businessCard/createProducts`;
  public DELETE_BUSINESS_CARD_PRODUCTS: string = `${this.PATH}/businessCard/deleteProducts`;

  //offers
  public GET_BUSINESS_CARD_OFFERS: string = `${this.PATH}/businessCard/getOffers`;
  public UPDATE_BUSINESS_CARD_OFFERS: string = `${this.PATH}/businessCard/updateOffers`;
  public DELETE_BUSINESS_CARD_OFFERS: string = `${this.PATH}/businessCard/deleteOffers`;
  public UPDATE_BUSINESSCARD_VISIBILITY: string = `${this.PATH}/businessCard/update-visibility`;
  public UPDATE_BUSINESSCARD_CONTACT_FORM_TITLE: string = `${this.PATH}/businessCard/updateContactRequestTitle`;

  //get in touch
  public GET_CONTACT_REQUEST: string = `${this.PATH}/businessCard/getContactRequest`;
  public DELETE_CONTACT_REQUEST: string = `${this.PATH}/businessCard/deleteContactRequest`;

  //share history
  public SHARED_HISTORY: string = `${this.PATH}/shared/history`;
  public SHARED_KEYWORDS: string = `${this.PATH}/shared/keywords`;
  public SHARED_DOWNLOADEXCEL: string = `${this.PATH}/shared/downloadExcel`;

  //customer
  public ADD_CUSTOMER: string = `${this.PATH}/customer/updateCustomer`;
  public GET_CUSTOMER: string = `${this.PATH}/customer/getCustomer`;
  public DELETE_CUSTOMER: string = `${this.PATH}/customer/deleteCustomer`;
  public SAVE_EXCEL_CUSTOMER: string = `${this.PATH}/customer/saveExcelCustomer`;

  // our Certificates
  public WEBSITE_CERTIFICATES_ADD: string = `${this.PATH}/website/certification/add`;
  public WEBSITE_CERTIFICATES_UPDATE: string = `${this.PATH}/website/certification/update`;
  public WEBSITE_CERTIFICATES_DELETE: string = `${this.PATH}/website/certification/delete`;

  // our Trust Badges
  public WEBSITE_TRUST_ADD: string = `${this.PATH}/website/ourTrust/add`;
  public WEBSITE_TRUST_UPDATE: string = `${this.PATH}/website/ourTrust/update`;
  public WEBSITE_TRUST_DELETE: string = `${this.PATH}/website/ourTrust/delete`;

  // our Faq
  public WEBSITE_FAQ_ADD: string = `${this.PATH}/website/faq/update`;
  public WEBSITE_FAQ_DELETE: string = `${this.PATH}/website/faq/delete`;

  // our Blogs
  public WEBSITE_BLOGS_ADD: string = `${this.PATH}/website/blog/update`;
  public WEBSITE_BLOGS_DELETE: string = `${this.PATH}/website/blog/delete`;

  // My ThemeColor
  public WEBSITE_THEMECOLOR_UPDATE: string = `${this.PATH}/website/theme-colors/update`;

  //veryfy token
  public VERIFY_TOKEN: string = `${this.PATH}/verify-token`;

  // Websites and Templates Themes
  public GETALL_WEBSITE_THEMES: string = `${this.PATH}/website/themes`;
  public WEBSITE_THEMES_UPDATE: string = `${this.PATH}/website/themes/update`;

  // Website Uniquename
  public WEBSITE_UNIQUE_NAME: string = `${this.PATH}/website/uniqueName/add`;
  public WEBSITE_NAME_SAVING: string = `${this.PATH}/website/uniqueName/update`;

  // Attendance apis
  public GET_OFFICES: string = `${this.PATH}/office/getAll`;
  public ADD_OFFICE: string = `${this.PATH}/office/create`;
  public UPDATE_OFFICE: string = `${this.PATH}/office/update`;
  public DELETE_OFFICE: string = `${this.PATH}/office/delete`;

  public GET_EMPLOYEES: string = `${this.PATH}/employees/get`;
  public ADD_EMPLOYEE: string = `${this.PATH}/employee/create`;
  public UPDATE_EMPLOYEE: string = `${this.PATH}/employee/update`;
  public DELETE_EMPLOYEE: string = `${this.PATH}/employee/delete`;
}

const storage = new AppStorage();
export let apiEndpoints = new ApiEndpoints(storage);
