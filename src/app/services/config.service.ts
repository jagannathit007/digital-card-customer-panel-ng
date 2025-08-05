import { Injectable } from '@angular/core';
import { AppStorage } from '../core/utilities/app-storage';
import { common } from '../core/constants/common';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

   constructor(private storage: AppStorage) {}

  get backendURL(): string {
    const app = this.storage.get(common.APP);
    return app?.domain?.backendLink;
  }

}
