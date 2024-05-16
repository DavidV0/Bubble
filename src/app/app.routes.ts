import { Routes } from '@angular/router';

// import components
import { ImprintComponent } from './imprint/imprint.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { GeneralViewComponent } from './general-view/general-view.component';
import { SigninComponent } from './register/signin/signin.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuardService } from './services/auth-guard.service';

export const routes: Routes = [
  { path: '', component: RegisterComponent, pathMatch: 'full' },
  { path: 'imprint', component: ImprintComponent },
  { path: 'privacy', component: PrivacyPolicyComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'resetPW', component: ResetpasswordComponent },
  {
    path: 'generalView',
    canActivate: [AuthGuardService],
    component: GeneralViewComponent,
  },

];
