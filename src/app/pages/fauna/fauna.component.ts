import { Component, OnInit } from '@angular/core';
import { FaunaFloraService } from '../../services/fauna-flora.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fauna',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fauna.component.html',
  styleUrls: ['./fauna.component.css']
})
export class FaunaComponent implements OnInit {
  faunaData: any;

  constructor(private faunaFloraService: FaunaFloraService) { }

  ngOnInit(): void {
    this.faunaFloraService.getFaunaData().subscribe(
      (data) => {
        this.faunaData = data;  
      },
      (error) => {
        console.error('Error fetching fauna data:', error);
      }
    );
  }
}
