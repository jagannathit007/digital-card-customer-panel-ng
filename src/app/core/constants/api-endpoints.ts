import { environment } from '../../../env/env.local';
import { AppStorage } from '../utilities/app-storage';
import { common } from './common';

class ApiEndpoints {
  constructor(private storage: AppStorage) {}

  // private app = this.storage.get(common.APP);
  // private baseURL = `${this.app?.domain?.backendLink || ''}`;
  // private PATH: string = `${this.baseURL}/${environment.route}`;

  private get PATH(): string { 
    const app = this.storage.get(common.APP);
    const baseURL = `${app?.domain?.backendLink || ''}`;
    return `${baseURL}/${environment.route}`;
  }

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

//  website service enquiry
  public DELETE_SERVICE_ENQUIRY: string = `${this.PATH}/website/service-enquiry/delete`;

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

// ! TASK MANAGEMENT ROUTES
// authentication routes
// router.post('/sign-in', teamMemberCtrl.signIn);
// router.post('/verify-invitation-token', teamMemberCtrl.verifyInvitationToken);

// router.post('/teamMember/add', isTaskAuth, teamMemberCtrl.addTeamMember);
// router.post('/teamMember/update', isTaskAuth, teamMemberCtrl.updateProfile);
// router.post('/teamMember/delete/:id', isTaskAuth, teamMemberCtrl.deleteTeamMember);
// router.post('/changePassword', isTaskAuth, teamMemberCtrl.changePassword);
// router.post('/teamMember/changeRole/:id', isTaskAuth, teamMemberCtrl.changeRole);

// // board routes
// router.post('/board/create', adminLevelPermission, boardCtrl.createBoard);
// router.post('/board/update/:boardId', adminLevelPermission, boardCtrl.updateBoard);
// router.post('/board/delete/:boardId', adminLevelPermission, boardCtrl.deleteBoard);
// router.post('/board/member/update', boardLevelPermission, boardCtrl.updateBoardMembers);
// router.post('/board/categories/update', adminLevelPermission, boardCtrl.updateBoardCategories);
// router.get('/board/all', adminLevelPermission, boardCtrl.getBoardsForAdmin);
// router.get('/board/joined', isTaskAuth, boardCtrl.getJoinedBoards);


// task management dashboard 
public TASK_DASHBOARD_STATS: string = `${this.PATH}/task/dashboard/stats`;
public TASK_DASHBOARD_RECENT_ACTIVITIES: string = `${this.PATH}/task/dashboard/recent-activities`;
public TASK_DASHBOARD_RECENTLY_CREATED_TASKS: string = `${this.PATH}/task/dashboard/recently-created-tasks`;
public TASK_DASHBOARD_EMPLOYEE_DAY_WISE_TASKS: string = `${this.PATH}/task/dashboard/employee-day-wise-tasks`;

public TEAM_MEMBER_SIGNIN: string = `${this.PATH}/task/sign-in`;
public TEAM_MEMBER_VERIFY_TOKEN: string = `${this.PATH}/task/verify-invitation-token`;
public TEAM_MEMBER_PROFILE: string = `${this.PATH}/task/get-current-user`;
public REINVITE_USER: string = `${this.PATH}/task/teamMember/resend-invitation`;

public GET_ALL_MEMBERS: string = `${this.PATH}/task/teamMember/getAll`;
public GET_ALL_SELECTABLE_TEAMMEMBERS: string = `${this.PATH}/task/teamMember/getSelectableTeamMembers`;

public ADD_TEAM_MEMBER: string = `${this.PATH}/task/teamMember/add`;
public UPDATE_TEAM_MEMBER: string = `${this.PATH}/task/teamMember/update`;
public DELETE_TEAM_MEMBER: string = `${this.PATH}/task/teamMember/delete`;
public CHANGE_MEMBER_PASSWORD: string = `${this.PATH}/task/changePassword`;
public CHANGE_ROLE: string = `${this.PATH}/task/teamMember/changeRole`;
public TOGGLE_MEMBER_STATUS: string = `${this.PATH}/task/teamMember/status/toggle`;


public CREATE_BOARD: string = `${this.PATH}/task/board/create`;
public UPDATE_BOARD: string = `${this.PATH}/task/board/update`;
public DELETE_BOARD: string = `${this.PATH}/task/board/delete`;
public UPDATE_BOARD_MEMBERS: string = `${this.PATH}/task/board/member/update`;
public UPDATE_BOARD_CATEGORIES: string = `${this.PATH}/task/board/categories/update`;
public GET_BOARDS_FOR_ADMIN: string = `${this.PATH}/task/board/all`;
public GET_BOARD_DETAILS: string = `${this.PATH}/task/board/get-details`;
public GET_BOARDS_NAMES: string = `${this.PATH}/task/board/allNames`;
public GET_JOINED_BOARDS: string = `${this.PATH}/task/board/joined`;
public GET_ALL_AVAILABLE_MEMBERS: string = `${this.PATH}/task/board/members/available`;
public GET_ALL_AVAILABLE_MEMBERS_FOR_BOARD: string = `${this.PATH}/task/board/members/available/for-board`;

// team task board routes
public GET_BOARD_TASKS: string = `${this.PATH}/task/team/get-all`;
public REORDER_BOARD_TASKS: string = `${this.PATH}/task/team/reorder`;
public GET_TASK_DETAILS: string = `${this.PATH}/task/team/get-details`;
public ADD_NEW_TEAM_TASK: string = `${this.PATH}/task/team/add`;

// update team task details routes
public CREATE_COMPLETE_TEAM_TASK: string = `${this.PATH}/task/team/create`;
public UPDATE_TEAM_TASK_Title: string = `${this.PATH}/task/team/update/title`;
public UPDATE_TEAM_TASK_STATUS: string = `${this.PATH}/task/team/update/status`;
public UPDATE_TEAM_TASK_DUE_DATE: string = `${this.PATH}/task/team/update/due-date`;
public UPDATE_TEAM_TASK_CATEGORY: string = `${this.PATH}/task/team/update/category`;
public UPDATE_TEAM_TASK_PRIORITY: string = `${this.PATH}/task/team/update/priority`;
public UPDATE_TEAM_TASK_DESCRIPTION: string = `${this.PATH}/task/team/update/description`;
public UPDATE_TEAM_TASK_ASSIGNED_TO: string = `${this.PATH}/task/team/update/assignment`;

// attachment routes
public GET_ATTACHMENTS: string = `${this.PATH}/task/attachment/get`;
public ADD_ATTACHMENT: string = `${this.PATH}/task/attachment/add`;
public DELETE_ATTACHMENT: string = `${this.PATH}/task/attachment/delete`;
public RENAME_ATTACHMENT: string = `${this.PATH}/task/attachment/file-name/update`;

// board column routes
public RENAME_COLUMN: string = `${this.PATH}/task/board/column/name/update`;
public GET_COLUMNS: string = `${this.PATH}/task/board/column/get-all`;
public ADD_NEW_COLUMN: string = `${this.PATH}/task/board/column/create`;
public DELETE_COLUMN: string = `${this.PATH}/task/board/column/delete`;
public REORDER_COLUMN: string = `${this.PATH}/task/board/column/reorder`;

// ! AI ASSISTETNT
public AI_ASSISTANT: string = `${this.PATH}/task/ai/process-user-voice`;
public GET_MEMBER_TASK_REPORT: string = `${this.PATH}/task/get-member-task-report`;

//  ! Task Module Comment Mention api
public GET_COMMENTS: string = `${this.PATH}/task/team/comment/get`;
public ADD_COMMENT: string = `${this.PATH}/task/team/comment/add`;
public DELETE_COMMENT: string = `${this.PATH}/task/team/comment/delete`;


//  ! PERSONAL TASK ROUTES
public ADD_PERSONAL_TASK: string = `${this.PATH}/task/personal/create`;
public UPDATE_PERSONAL_TASK: string = `${this.PATH}/task/personal/update`;
public DELETE_PERSONAL_TASK: string = `${this.PATH}/task/personal/delete`;
public TOGGLE_PERSONAL_TASK_STATUS: string = `${this.PATH}/task/personal/staus/toggle`;
public GET_PERSONAL_TASK_DETAILS: string = `${this.PATH}/task/personal/get-details`
public GET_PERSONAL_ALL_TODAY_TASK_DETAILS: string = `${this.PATH}/task/personal/getTodayCreatedTasks`
public GET_ALL_TASKS_WITHOUT_DUE_DATE: string = `${this.PATH}/task/personal/getAllTasksWithoutDueDate`
public GET_WEEK_TASK_DETAILS: string = `${this.PATH}/task/personal/getWeekTasks`
public GET_PERSONAL_TASK_STATS: string = `${this.PATH}/task/personal/stats`;
public GET_PERSONAL_TASK_DETAILS_COUNT: string = `${this.PATH}/task/personal/taskconut`;

public GET_ALL_TASKS: string = `${this.PATH}/task/personal/all`;

// ! ADMIN CALENDERSYNS
public GET_GOOGLE_INITIATE: string = `${this.PATH}/task/google/initiate`;
public GET_GOOGLE_CALENDAR_ID: string = `${this.PATH}/task/google/calendar-id`;


  // Attendance apis
  public GET_OFFICES: string = `${this.PATH}/office/getAll`;
  public ADD_OFFICE: string = `${this.PATH}/office/create`;
  public UPDATE_OFFICE: string = `${this.PATH}/office/update`;
  public DELETE_OFFICE: string = `${this.PATH}/office/delete`;

  public GET_EMPLOYEES: string = `${this.PATH}/employees/get`;
  public ADD_EMPLOYEE: string = `${this.PATH}/employee/create`;
  public UPDATE_EMPLOYEE: string = `${this.PATH}/employee/update`;
  public DELETE_EMPLOYEE: string = `${this.PATH}/employee/delete`;

  public GET_ATTENDANCE_LIST: string = `${this.PATH}/attendance/list`;
  public GET_ATTENDANCE_STATS: string = `${this.PATH}/attendance/stats`;
  public SEND_NOTIFICATION: string = `${this.PATH}/attendance/send-notification`;


  public GET_CUSTOM_FIELDS: string = `${this.PATH}/employee/custom-fields`;

  public GENERATE_ATTENDANCE_REPORT: string = `${this.PATH}/attendance/report`;

  public GET_LEAVES: string = `${this.PATH}/leave/list`;
  public MANAGE_LEAVE: string = `${this.PATH}/leave/manage`;
  public APPLY_LEAVE: string = `${this.PATH}/leave/apply`;

//  ! CRM Module
public GET_CRM_DETAILS: string = `${this.PATH}/crm/get-details`;
public GET_CRM_COLUMNS: string = `${this.PATH}/crm/column/get-all`;
public CREATE_CRM_COLUMN: string = `${this.PATH}/crm/column/create`;
public REORDER_CRM_COLUMN: string = `${this.PATH}/crm/column/reorder`;

// CRM Leads
public ADD_LEAD: string = `${this.PATH}/crm/lead/add`;
public CREATE_LEAD: string = `${this.PATH}/crm/lead/create`;
public GET_LEADS: string = `${this.PATH}/crm/lead/get-all`;
public GET_LEAD_DETAILS: string = `${this.PATH}/crm/lead/get-details`;
public UPDATE_LEAD_TITLE: string = `${this.PATH}/crm/lead/update/title`;
public UPDATE_LEAD_DESCRIPTION: string = `${this.PATH}/crm/lead/update/description`;
public UPDATE_LEAD_CATEGORY: string = `${this.PATH}/crm/lead/update/category`;
public UPDATE_LEAD_PRIORITY: string = `${this.PATH}/crm/lead/update/priority`;
public UPDATE_LEAD_CLOSING_DATE: string = `${this.PATH}/crm/lead/update/closing-date`;
public UPDATE_LEAD_QUOTATION_DATE: string = `${this.PATH}/crm/lead/update/quotation-date`;
public UPDATE_LEAD_ASSIGNED_TO: string = `${this.PATH}/crm/lead/update/assigned-to`;
public UPDATE_LEAD_CONTACT_DETAILS: string = `${this.PATH}/crm/lead/update/contact-details`;
public UPDATE_LEAD_AMOUNT: string = `${this.PATH}/crm/lead/update/amount`;
public UPDATE_LEAD_PRODUCT: string = `${this.PATH}/crm/lead/update/product`;
public DELETE_LEAD: string = `${this.PATH}/crm/lead/delete`;
public REORDER_LEAD: string = `${this.PATH}/crm/lead/reorder`;
public MARK_LEAD_WON: string = `${this.PATH}/crm/lead/mark-won`;
public MARK_LEAD_LOST: string = `${this.PATH}/crm/lead/mark-lost`;

// CRM Categories
public GET_CRM_CATEGORIES: string = `${this.PATH}/crm/categories/get-all`;

// CRM Team Members
public GET_CRM_TEAM_MEMBERS: string = `${this.PATH}/crm/team-members/get-all`;

// CRM Reports
public GET_CRM_MEMBER_REPORT: string = `${this.PATH}/crm/member-report`;

// CRM Attachments
public GET_CRM_ATTACHMENTS: string = `${this.PATH}/crm/attachment/get`;
public ADD_CRM_ATTACHMENT: string = `${this.PATH}/crm/attachment/add`;
public DELETE_CRM_ATTACHMENT: string = `${this.PATH}/crm/attachment/delete`;

// ! IDEA BOARD MODULE
public ADD_IDEA: string = `${this.PATH}/ideas/add`;
public GET_IDEAS: string = `${this.PATH}/ideas/list`;
public UPDATE_IDEA: string = `${this.PATH}/ideas/update`;
public DELETE_IDEA: string = `${this.PATH}/ideas/delete`;
public ADD_IDEA_CATEGORY: string = `${this.PATH}/ideas/categories/add`;
public GET_IDEA_CATEGORIES: string = `${this.PATH}/ideas/categories/list`;
public UPDATE_IDEA_CATEGORY: string = `${this.PATH}/ideas/categories/update`;
public DELETE_IDEA_CATEGORY: string = `${this.PATH}/ideas/categories/delete`;

}

export let apiEndpoints = new ApiEndpoints(new AppStorage());