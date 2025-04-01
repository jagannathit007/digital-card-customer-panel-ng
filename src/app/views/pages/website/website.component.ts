import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './website-details/home/home.component';
import { AboutSectionComponent } from './website-details/about-section/about-section.component';
import { OurProductsComponent } from './website-details/our-products/our-products.component';
import { OurTeamComponent } from './website-details/our-team/our-team.component';
import { OurServicesComponent } from './website-details/our-services/our-services.component';
import { OurClientsComponent } from './website-details/our-clients/our-clients.component';
import { AuthService } from 'src/app/services/auth.service';
import { AppStorage } from 'src/app/core/utilities/app-storage';
import { common } from 'src/app/core/constants/common';
import { TestimonialsComponent } from './website-details/testimonials/testimonials.component';
import { ThemesComponent } from './website-details/themes/themes.component';
import { SeoDetailsComponent } from './website-details/seo-details/seo-details.component';
import { ContactDetailsComponent } from './website-details/contact-details/contact-details.component';
@Component({
  selector: 'app-website',
  standalone: true,
  imports: [
    FormsModule,
    HomeComponent,
    OurProductsComponent,
    OurTeamComponent,
    OurServicesComponent,
    OurClientsComponent,
    AboutSectionComponent,
    TestimonialsComponent,
    ThemesComponent,
    SeoDetailsComponent,
    ContactDetailsComponent,
  ],
  templateUrl: './website.component.html',
  styleUrl: './website.component.scss',
})
export class WebsiteComponent { constructor(public authService: AuthService, private storage: AppStorage){
    this.authService.selectedBusinessCard = this.storage.get(common.BUSINESS_CARD) ?? "";
    this.selectedTab = {
      title: "Home",
      href: "home",
    };
  }

  selectedTab = {
    title: "Home",
    href: "home",
  };

  tabs = [
    {
      title: "Home",
      href: "home",
    },
    {
      title: "Our Products",
      href: "our-products",
    },
    {
      title: "Our Team",
      href: "our-team",
    },
    {
      title: "Our Services",
      href: "our-services",
    },
    {
      title: "Our Clients",
      href: "our-clients",
    },
    {
      title: "About Section",
      href: "about-section",
    },
    {
      title: "Testimonials",
      href: "testimonials",
    },
    {
      title: "Themes",
      href: "themes",
    },
    {
      title: "SEO Details",
      href: "seo-details",
    },
    {
      title: "Contact Details",
      href: "contact-details",
    },
  ]

}
