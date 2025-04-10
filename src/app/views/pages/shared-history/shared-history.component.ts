import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { common } from 'src/app/core/constants/common';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { ModalService } from 'src/app/core/utilities/modal';
import { AuthService } from 'src/app/services/auth.service';
import { ShareHistoryService } from 'src/app/services/share-history.service';

@Component({
  selector: 'app-shared-history',
  standalone: true,
   imports: [CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './shared-history.component.html',
  styleUrl: './shared-history.component.scss'
})
export class SharedHistoryComponent {

  constructor(
      private shareHistoryService: ShareHistoryService,
      private storage: AppStorage,
      private cdr: ChangeDetectorRef,
      private modalService: ModalService,
      private authService: AuthService
    ) { }
    businessCard: any;
    ngOnInit(): void {
      this.businessCard = this.storage.get(common.BUSINESS_CARD);
      this.payload.businessCardId = this.businessCard
      this._getShareHistory();
      // this.getKeywords();
    }
  
    payload = {
      search: '',
      page: 1,
      limit: 10,
      businessCardId: ''
    }
  
    onChange() {
      this.payload.page = 1
      this._getShareHistory();
    }
  
    isLoading: boolean = false;
    historyDetails: any = { docs: [] }
    _getShareHistory = async () => {
      try {
        this.isLoading = true
        let response = await this.shareHistoryService.getSharedHistory(this.payload)
        if (response) {
          this.historyDetails = response
        }
        this.isLoading = false
        this.cdr.detectChanges();
      } catch (error) {
        this.isLoading = false
        this.cdr.detectChanges();
        console.log("Something went wrong", error)
      }
    }
  
    onPageChange(page: number) {
      this.payload.page = page;
      this._getShareHistory()
    }
  
    onOpenExportModal() {
      this.modalService.open('exportModal')
    }
  
    selectedKeyword = "";
    keywords: any[] = [];
    getKeywords = async () => {
      let response = await this.shareHistoryService.getSharedKeyword({ businessCardId: this.businessCard });
      if (response != null) {
        this.keywords = response;
        this.keywords.sort();
      }
    };
  
    _exportExcel = async () => {
      this.shareHistoryService.downloadExcel({
        businessCardId: this.businessCard
      });
    }
}
