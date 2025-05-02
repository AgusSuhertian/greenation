import { TestBed } from '@angular/core/testing';
import { RouterModule, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../auth.service';
import { of } from 'rxjs';

class MockAuthService {
  isAuthenticated() {
    return of(true);
  }
}

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])], 
      providers: [
        AuthGuard,
        { provide: AuthService, useClass: MockAuthService }, 
      ],
    });
    guard = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation', (done) => {
    const routeSnapshot = {} as RouterStateSnapshot;
    const activatedRouteSnapshot = {} as ActivatedRouteSnapshot; 

   
    guard.canActivate(activatedRouteSnapshot, routeSnapshot).subscribe(result => {
      expect(result).toBe(true);
      done();
    });
  });
});
