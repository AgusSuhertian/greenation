import { TestBed } from '@angular/core/testing';

import { FaunaFloraService } from './fauna-flora.service';

describe('FaunaFloraService', () => {
  let service: FaunaFloraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaunaFloraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
