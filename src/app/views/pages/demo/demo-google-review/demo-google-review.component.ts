import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-demo-google-review',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './demo-google-review.component.html',
  styleUrl: './demo-google-review.component.scss',
})
export class DemoGoogleReviewComponent { 
  reviews: any[] = [
    {
      name: 'Aarav Sharma',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      location: 'Mumbai, Maharashtra',
      rating: 5,
      comment: 'Excellent service! The team was very professional and delivered beyond my expectations. Highly recommended!',
      date: new Date('2023-06-15'),
      response: 'Thank you Aarav for your kind words! We look forward to serving you again.'
    },
    {
      name: 'Priya Patel',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      location: 'Ahmedabad, Gujarat',
      rating: 4,
      comment: 'Good quality products and timely delivery. Would have given 5 stars if the packaging was better.',
      date: new Date('2023-06-10'),
      response: 'We appreciate your feedback Priya. We\'ll work on improving our packaging.'
    },
    {
      name: 'Rahul Singh',
      avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
      location: 'Delhi',
      rating: 5,
      comment: 'Best in the business! I\'ve tried many services but this one stands out for their customer support.',
      date: new Date('2023-05-28')
    },
    {
      name: 'Neha Gupta',
      avatar: 'https://randomuser.me/api/portraits/women/63.jpg',
      location: 'Bangalore, Karnataka',
      rating: 3,
      comment: 'Average experience. The product was good but delivery was delayed by 3 days.',
      date: new Date('2023-05-22'),
      response: 'We apologize for the delay Neha. We\'re improving our logistics process.'
    },
    {
      name: 'Vikram Joshi',
      avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
      location: 'Pune, Maharashtra',
      rating: 5,
      comment: 'Outstanding quality! Worth every penny. Will definitely purchase again.',
      date: new Date('2023-05-18')
    },
    {
      name: 'Ananya Reddy',
      avatar: 'https://randomuser.me/api/portraits/women/71.jpg',
      location: 'Hyderabad, Telangana',
      rating: 3,
      comment: 'Not satisfied with the product quality. Expected better for the price paid.',
      date: new Date('2023-05-10'),
      response: 'We\'re sorry to hear this Ananya. Please contact our support for a replacement.'
    },
    {
      name: 'Arjun Malhotra',
      avatar: 'https://randomuser.me/api/portraits/men/85.jpg',
      location: 'Chennai, Tamil Nadu',
      rating: 4,
      comment: 'Good service overall. The staff was very helpful and knowledgeable.',
      date: new Date('2023-04-30')
    },
    {
      name: 'Divya Iyer',
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
      location: 'Kochi, Kerala',
      rating: 5,
      comment: 'Amazing experience from start to finish. Will recommend to all my friends!',
      date: new Date('2023-04-25')
    },
    {
      name: 'Rohan Verma',
      avatar: 'https://randomuser.me/api/portraits/men/29.jpg',
      location: 'Kolkata, West Bengal',
      rating: 3,
      comment: 'Very poor customer service. My complaint was not addressed properly.',
      date: new Date('2023-04-20'),
      response: 'We sincerely apologize Rohan. Our manager will contact you personally.'
    },
    {
      name: 'Ishita Chatterjee',
      avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
      location: 'Jaipur, Rajasthan',
      rating: 4,
      comment: 'Happy with the purchase. The product matches the description perfectly.',
      date: new Date('2023-04-15')
    },
    {
      name: 'Aditya Nair',
      avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
      location: 'Lucknow, Uttar Pradesh',
      rating: 5,
      comment: 'Exceptional quality and service. Exceeded all my expectations!',
      date: new Date('2023-04-10')
    },
    {
      name: 'Meera Kapoor',
      avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
      location: 'Chandigarh',
      rating: 3,
      comment: 'Product was okay, but the customer service could be improved.',
      date: new Date('2023-04-05')
    },
    {
      name: 'Karan Mehta',
      avatar: 'https://randomuser.me/api/portraits/men/76.jpg',
      location: 'Surat, Gujarat',
      rating: 5,
      comment: 'Fast delivery and excellent packaging. Very happy with my purchase.',
      date: new Date('2023-03-28')
    },
    {
      name: 'Pooja Desai',
      avatar: 'https://randomuser.me/api/portraits/women/88.jpg',
      location: 'Nagpur, Maharashtra',
      rating: 4,
      comment: 'Good value for money. Would buy again from this store.',
      date: new Date('2023-03-20')
    },
    {
      name: 'Siddharth Choudhary',
      avatar: 'https://randomuser.me/api/portraits/men/93.jpg',
      location: 'Bhopal, Madhya Pradesh',
      rating: 5,
      comment: 'Perfect in every way! The attention to detail is impressive.',
      date: new Date('2023-03-15')
    }
  ];
}
