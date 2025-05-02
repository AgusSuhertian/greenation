import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent }    from './app.component';
import { HomeComponent }   from './pages/home/home.component';
import { FaunaComponent }  from './pages/fauna/fauna.component';
import { FloraComponent }  from './pages/flora/flora.component';
import { LoginComponent }  from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard }      from './guards/auth.guard';
import { routes }         from './app.routes';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FaunaComponent,
    FloraComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes),
   
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule {}
