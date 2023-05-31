import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ng15';
  values = [
    {
      type: 'aa',
      key: 'A',
      description: 'A',
      enabled: true,
    },
  ];
}
