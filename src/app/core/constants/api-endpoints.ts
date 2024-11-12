import { environment } from '../../../env/env.local';

class ApiEndpoints {
  private PATH: string = `${environment.baseURL}/${environment.route}`;
  public SIGN_IN: string = `${this.PATH}/login`;

  public GET_ADMINS: string = `${this.PATH}/getAdmins`;
  public CREATE_ADMIN: string = `${this.PATH}/create-admin`;
  public DELETE_ADMIN: string = `${this.PATH}/deleteAdmin`;

  public GET_COURSES: string = `${this.PATH}/getCourses`;
  public SAVE_COURSES: string = `${this.PATH}/saveCourse`;
  public DELETE_COURSES: string = `${this.PATH}/deleteCourse`;

  public GET_ALL_TECHNOLOGIES: string = `${this.PATH}/getAllTechnologies`;
  public GET_TECHNOLOGIES: string = `${this.PATH}/getTechnologies`;
  public SAVE_TECHNOLOGY: string = `${this.PATH}/saveTechnology`;
  public DELETE_TECHNOLOGY: string = `${this.PATH}/deleteTechnology`;

  public GET_EXPERTISES: string = `${this.PATH}/getExpertises`;
  public SAVE_EXPERTISE: string = `${this.PATH}/saveExpertise`;
  public DELETE_EXPERTISE: string = `${this.PATH}/deleteExpertise`;

  public GET_PRODUCTS: string = `${this.PATH}/getProducts`;
  public SAVE_PRODUCT: string = `${this.PATH}/saveProduct`;
  public DELETE_PRODUCT: string = `${this.PATH}/deleteProduct`;
}

export let apiEndpoints = new ApiEndpoints();
