import { Routes } from '@angular/router';
import { Search } from './features/search/search/search';

export const routes: Routes = [
  { path: '', component: Search },
  { path: 'search', component: Search },
  { path: '**', redirectTo: '' }
];
