import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaunaDetailComponent } from './fauna-detail.component';

describe('FaunaDetailComponent', () => {
  let component: FaunaDetailComponent;
  let fixture: ComponentFixture<FaunaDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaunaDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaunaDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
