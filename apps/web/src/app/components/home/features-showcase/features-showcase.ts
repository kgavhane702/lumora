import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureCardComponent, Feature } from '../../../shared/components/ui/feature-card/feature-card';

@Component({
  selector: 'app-features-showcase',
  standalone: true,
  imports: [CommonModule, FeatureCardComponent],
  templateUrl: './features-showcase.html',
  styleUrls: ['./features-showcase.scss']
})
export class FeaturesShowcaseComponent {
  features: Feature[] = [
    {
      id: 'smart-search',
      title: 'Smart Search',
      description: 'Get accurate answers with AI-powered search',
      icon: 'search'
    },
    {
      id: 'conversational',
      title: 'Conversational',
      description: 'Ask follow-up questions naturally',
      icon: 'chat'
    },
    {
      id: 'verified-sources',
      title: 'Verified Sources',
      description: 'All answers come with reliable references',
      icon: 'verified'
    },
    {
      id: 'lightning-fast',
      title: 'Lightning Fast',
      description: 'Get instant answers in seconds',
      icon: 'speed'
    }
  ];

  trackByFeature(index: number, feature: Feature): string {
    return feature.id;
  }
}