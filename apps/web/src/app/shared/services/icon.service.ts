import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IconService {
  private icons: { [key: string]: string } = {
    'search': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/>
    </svg>`,
    'send': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M120-160v-640l760 320-760 320Zm80-120 474-198-474-198v140l240 58-240 58v140Zm0 0v-140 140Z"/>
    </svg>`,
    'close': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
    </svg>`,
    'add': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M440-440H200q-17 0-28.5-11.5T160-480q0-17 11.5-28.5T200-520h240v-240q0-17 11.5-28.5T480-800q17 0 28.5 11.5T520-760v240h240q17 0 28.5 11.5T800-480q0 17-11.5 28.5T760-440H520v240q0 17-11.5 28.5T480-160q-17 0-28.5-11.5T440-200v-240Z"/>
    </svg>`,
    'home': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/>
    </svg>`,
    'chat': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M240-400h480v-80H240v80Zm0 160h280v-80H240v80Zm0-320h480v-80H240v80ZM80-80v-800h800v640L640-80H80Z"/>
    </svg>`,
    'explore': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
    </svg>`,
    'apps': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M120-120v-240h240v240H120Zm300 0v-240h240v240H420Zm300 0v-240h240v240H720ZM120-420v-240h240v240H120Zm300 0v-240h240v240H420Zm300 0v-240h240v240H720ZM120-720v-240h240v240H120Zm300 0v-240h240v240H420Zm300 0v-240h240v240H720Z"/>
    </svg>`,
    'folder': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640v400q0 33-23.5 56.5T800-160H160Z"/>
    </svg>`,
    'settings': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="m370-80-16-128q-13-5-24.5-14T307-235l-119 27L101-300l104-78q-2-9-2-20t2-20L101-496l87-65 87 27q11-8 22.5-17t24.5-14l16-128h220l16 128q13 5 24.5 14t22.5 17l87-27 87 65-104 78q2 9 2 20t-2 20l104 78-87 65-87-27q-11 8-22.5 17T586-208L570-80H370Zm112-260q58 0 99-41t41-99q0-58-41-99t-99-41q-58 0-99 41t-41 99q0 58 41 99t99 41Z" fill="currentColor"/>
    </svg>`,
    'star': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/>
    </svg>`,
    'person': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/>
    </svg>`,
    'more-vert': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/>
    </svg>`,
    'edit': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M200-200h56l345-345-56-56-345 345v56Zm-80 80v-128l504-504q12-12 28-12t28 12l56 56q12 12 12 28t-12 28L200-120H120Zm400-584-56-56 56 56Zm-141 43 28 28-141 141-28-28 141-141Z"/>
    </svg>`,
    'content-copy': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h400q33 0 56.5 23.5T840-800v480q0 33-23.5 56.5T760-240H360Zm0-80h400v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h560v80H200Zm160-240v-480 480Z"/>
    </svg>`,
    'share': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M720-80q-50 0-85-35t-35-85q0-7 1-14t3-13L287-317q-5 4-10 6t-11 2q-50 0-85-35t-35-85q0-50 35-85t85-35q6 0 11 2t10 6l312-184q-2-6-3-13t-1-14q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-6 0-11-2t-10-6L408-384q2 6 3 13t1 14q0 7-1 14t-3 13l312 184q5-4 10-6t11-2q50 0 85 35t35 85q0 50-35 85t-85 35Z"/>
    </svg>`,
    'open-in-new': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm480-480v-80h240v240h-80v-104L456-168l-56-56 224-224H520Z"/>
    </svg>`,
    'trending-up': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="m280-280 200-200 160 160 200-200v120H280v-120Z"/>
    </svg>`,
    'check': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
    </svg>`,
    'menu': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
    </svg>`,
    'verified': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M480-120q-75 0-140.5-28.5T240-240q-63-63-91.5-128.5T120-508q0-75 28.5-140.5T240-777q63-63 128.5-91.5T508-897q75 0 140.5 28.5T777-777q63 63 91.5 128.5T897-508q0 75-28.5 140.5T777-240q-63 63-128.5 91.5T508-120Zm-80-240 200-200 56 56-256 256-120-120 56-56 64 64Z"/>
    </svg>`,
    'speed': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M480-120q-75 0-140.5-28.5T240-240q-63-63-91.5-128.5T120-508q0-75 28.5-140.5T240-777q63-63 128.5-91.5T508-897q75 0 140.5 28.5T777-777q63 63 91.5 128.5T897-508q0 75-28.5 140.5T777-240q-63 63-128.5 91.5T508-120Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
    </svg>`,
    'stop': `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
      <path d="M400-400h160v160H400v-160Z"/>
    </svg>`
  };

  getIconPath(iconName: string): string {
    return this.icons[iconName] || '';
  }

  getIconNames(): string[] {
    return Object.keys(this.icons);
  }

  hasIcon(iconName: string): boolean {
    return iconName in this.icons;
  }
} 