import { Component, OnInit } from '@angular/core';
import { FaunaFloraService } from '../../services/fauna-flora.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flora',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flora.component.html',
  styleUrls: ['./flora.component.css']
})
export class FloraComponent implements OnInit {
  floraData: any;

  constructor(private faunaFloraService: FaunaFloraService) { }

  ngOnInit(): void {
    this.faunaFloraService.getFloraData().subscribe(
      (data) => {
        this.floraData = data;
      },
      (error) => {
        console.error('Error fetching flora data:', error);
      }
    );
  }
}
