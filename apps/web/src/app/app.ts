import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Icon } from './shared/components/icon/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Icon],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  title = 'lumora';
  isMobileMenuOpen = false;

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
}
