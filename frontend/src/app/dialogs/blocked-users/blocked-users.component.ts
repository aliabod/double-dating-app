import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {UserService} from "../../services/user.service";
import {first} from "rxjs/operators";
import {GetAllMessages, GetUserDetails} from "../../state/main.state";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Store} from "@ngxs/store";

@Component({
  selector: 'app-blocked-users',
  templateUrl: './blocked-users.component.html',
  styleUrls: ['./blocked-users.component.css']
})
export class BlockedUsersComponent implements OnInit {
  blockedUsers = [];

  constructor(@Inject(MAT_DIALOG_DATA) private injectedData: any,
              private userService: UserService,
              private _snackBar: MatSnackBar,
              private store: Store) {
  }

  ngOnInit(): void {
    this.userService
      .getBlocked(this.injectedData.user)
      .pipe(first())
      .subscribe(
        (data) => {
          if (data) {
            this.blockedUsers = data;
          }
        }
      );
  }

  unblockUser(user): void {
    this.userService
      .unblockUser(this.injectedData.user, user)
      .pipe(first())
      .subscribe(
        (data) => {
          if (data) {
            console.log(data);
            if(data.status === 'OK') {
              this.blockedUsers = data.msg;
            } else if(data.status === 'Error' && data.msg === 'No blocked users!') {
              this.blockedUsers = [];
            }
            let snackBarRef = this._snackBar.open('User unblocked!', 'OK', {
              duration: 3000
            });
            this.store.dispatch(new GetAllMessages(this.injectedData.user));
          }
        }
      );
  }
}
