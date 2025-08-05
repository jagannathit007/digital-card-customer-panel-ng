import { ViewChild } from '@angular/core';

class CommonConstant {
  appStorage: any;
  constructor() {}
  public BUSINESS_CARD: string = 'business_card';
  public TOKEN: string = 'token';
  public USER_DATA: string = 'userInfo';
  public APP:string='apps';
}
export let common = new CommonConstant();
