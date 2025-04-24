import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-website',
  templateUrl: './website.component.html',
  styleUrl: './website.component.scss',
})
export class WebsiteComponent{
   constructor(
       public authService: AuthService, 
       private storage: AppStorage,
       private router:Router,
       private route:ActivatedRoute
     ){

     }
     ngOnInit(): void {
         const currentChildRoute = this.route.snapshot.firstChild?.routeConfig?.path;
         if (currentChildRoute) {
           this.selectedTab = currentChildRoute;
         } else {
           this.navigateToTab('home');
         }
     }
   
     selectedTab =  "home"
     navigateToTab(path: string) {
       this.selectedTab=path
       this.router.navigate([path], { relativeTo: this.route });
     }
   
     tabs = [
      {
        title: "Home",
        href: "home",
        icon:"ri-home-3-line"
      },
      {
        title: "Our Products",
        href: "our-products",
        icon:'ri-instance-fill'
      },
      {
        title: "Our Team",
        href: "our-team",
        icon:'ri-group-line'
      },
      {
        title: "Our Services",
        href: "our-services",
        icon:'ri-service-fill'
      },
      {
        title: "Our Clients",
        href: "our-clients",
        icon:'ri-user-follow-fill'
      },
      {
        title: "About Section",
        href: "about-section",
        icon:'ri-information-2-fill'
      },
      {
        title: "Testimonials",
        href: "testimonials",
        icon:'ri-chat-quote-fill'
      },
      {
        title: "Themes",
        href: "themes",
        icon:'ri-paint-brush-fill'
      },
      {
        title: "SEO Details",
        href: "seo-details",
        icon:'ri-seo-fill'
      },
      {
        title: "Contact Details",
        href: "contact-details",
        icon:'ri-phone-fill'
      },
      {
        title: "products-enquiry",
        href: "products-enquiry",
        icon:'ri-instance-fill'
      },
    ]
   
     isActive(href: string): boolean {
       return this.selectedTab === href;
     }
   

}
