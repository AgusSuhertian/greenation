import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  template: `
    <textarea [(ngModel)]="text"></textarea>
    <div *ngFor="let i of items">{{i}}</div>
  `
})
export class TestComponent {
  text = '';
  items = [1, 2, 3];
}
