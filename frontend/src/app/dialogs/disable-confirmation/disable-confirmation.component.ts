import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {UserService} from "../../services/user.service";
import {first} from "rxjs/operators";
import {GetUserDetails} from "../../state/main.state";
import {Store} from "@ngxs/store";
import {AuthenticationService} from "../../services/authentication.service";

@Component({
  selector: 'app-disable-confirmation',
  templateUrl: './disable-confirmation.component.html',
  styleUrls: ['./disable-confirmation.component.css']
})
export class DisableConfirmationComponent implements OnInit {
  userData: any;
  userDisabled: true;
  currentUser: any;

  constructor(@Inject(MAT_DIALOG_DATA) private injectedData: any, private userService: UserService, private store: Store, private authenticationService: AuthenticationService) {
    this.userData = injectedData.user;
    this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit(): void {
  }

  disable(): void {
    this.userService
      .disableAccount(this.userData)
      .pipe(first())
      .subscribe(
        (data) => {
          if (data !== null) {
            this.userDisabled = true;
            this.store.dispatch(new GetUserDetails(this.currentUser));
          }
        }
      );
  }
}
