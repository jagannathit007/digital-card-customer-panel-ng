import { ViewChild } from '@angular/core';

class CommonConstant {
  appStorage: any;
  constructor() {}
  public TOKEN: string = 'token';
  public USER_DATA: string = 'userInfo';
}
export let common = new CommonConstant();
