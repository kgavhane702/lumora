import { Routes } from '@angular/router';
import { Search } from './features/search/search/search';
import { Travel } from './features/travel/travel/travel';

export const routes: Routes = [
  { path: '', component: Travel },
  { path: 'search', component: Search },
  { path: 'travel', component: Travel },
  { path: '**', redirectTo: '' }
];
