import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloraDetailComponent } from './flora-detail.component';

describe('FloraDetailComponent', () => {
  let component: FloraDetailComponent;
  let fixture: ComponentFixture<FloraDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloraDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloraDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
