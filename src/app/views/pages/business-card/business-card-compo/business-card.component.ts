import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-business-card',
  templateUrl: './business-card.component.html',
  styleUrl: './business-card.component.scss',
})
export class BusinessCardComponent implements OnInit{

  constructor(
    public authService: AuthService, 
    private storage: AppStorage,
    private router:Router,
    private route:ActivatedRoute
  ){
    this.authService.selectedBusinessCard = this.storage.get(common.BUSINESS_CARD) ?? "";
  }
  ngOnInit(): void {
      const currentChildRoute = this.route.snapshot.firstChild?.routeConfig?.path;
      if (currentChildRoute) {
        this.selectedTab = currentChildRoute;
      } else {
        this.navigateToTab('personal-details');
      }
  }

  selectedTab =  "personal-details"
  navigateToTab(path: string) {
    this.selectedTab=path
    this.router.navigate([path], { relativeTo: this.route });
  }

  tabs = [
    {
      title: "Personal Details",
      href: "personal-details",
      icon:"ri-user-3-fill"
    },
    {
      title: "Business Details",
      href: "business-details",
      icon:"ri-info-card-fill"
    },
    {
      title: "Document Details",
      href: "document-details",
      icon:"ri-article-fill"
      
    },
    {
      title: "Themes",
      href: "themes",
      icon:"ri-brush-ai-fill"
      
    },
    {
      title: "Galleries",
      href: "gallery-details",
      icon:"ri-gallery-fill"
      
    },
    {
      title: "Products",
      href: "products",
      icon:"ri-instance-fill"
      
    },
    {
      title: "Services",
      href: "services",
      icon:"ri-shake-hands-fill"
      
    },
  ]

  isActive(href: string): boolean {
    return this.selectedTab === href;
  }

}
