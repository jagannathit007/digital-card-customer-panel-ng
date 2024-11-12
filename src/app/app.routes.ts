import { Routes } from '@angular/router';
import { SignInComponent } from './views/pages/auth/sign-in/sign-in.component';
import { HomeLayoutComponent } from './views/partials/home-layout/home-layout.component';
import { DashboardComponent } from './views/pages/dashboard/dashboard.component';
import { AdminComponent } from './views/pages/admin/admin.component';
import { CoursesComponent } from './views/pages/courses/courses.component';
import { TechnologiesComponent } from './views/pages/technologies/technologies.component';
import { PortfolioComponent } from './views/pages/portfolio/portfolio.component';
import { ExpertiseComponent } from './views/pages/expertise/expertise.component';
import { ProductsComponent } from './views/pages/products/products.component';
import { TestimonialsComponent } from './views/pages/testimonials/testimonials.component';
import { JobApplicationsComponent } from './views/pages/job-applications/job-applications.component';
import { HiringInquiresComponent } from './views/pages/hiring-inquires/hiring-inquires.component';
import { CourseInquiresComponent } from './views/pages/course-inquires/course-inquires.component';
import { ContactInquiresComponent } from './views/pages/contact-inquires/contact-inquires.component';
import { HireDevelopersComponent } from './views/pages/hire-developers/hire-developers.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: 'auth/login', component: SignInComponent },
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'admins', component: AdminComponent },
      { path: 'courses', component: CoursesComponent },
      { path: 'technologies', component: TechnologiesComponent },
      { path: 'portfolio', component: PortfolioComponent },
      { path: 'expertise', component: ExpertiseComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'hire-developers', component: HireDevelopersComponent },
      { path: 'testimonial', component: TestimonialsComponent },
      { path: 'job-applications', component: JobApplicationsComponent },
      { path: 'hiring-inquires', component: HiringInquiresComponent },
      { path: 'course-inquires', component: CourseInquiresComponent },
      { path: 'contact-inquires', component: ContactInquiresComponent },
    ],
  },
];
