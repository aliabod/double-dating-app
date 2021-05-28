import {Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Subject} from 'rxjs';
import {LoginDialogComponent} from '../dialogs/login-dialog/login-dialog.component';
import {SignupDialogComponent} from '../dialogs/signup-dialog/signup-dialog.component';
import {MessageDialogComponent} from '../dialogs/message-dialog/message-dialog.component';
import {DisableConfirmationComponent} from '../dialogs/disable-confirmation/disable-confirmation.component';
import {BlockedUsersComponent} from '../dialogs/blocked-users/blocked-users.component';
import {BuddyUpDialogComponent} from '../dialogs/buddy-up-dialog/buddy-up-dialog.component';
import {BuddyMessageDialogComponent} from "../dialogs/buddy-message-dialog/buddy-message-dialog.component";

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) {
  }

  loginDialog(): void {
    this.dialog.open(LoginDialogComponent, {width: '40vw'});
  }

  signupDialog(): void {
    this.dialog.open(SignupDialogComponent, {width: '40vw'});
  }

  messageDialog(message): void {
    this.dialog.open(MessageDialogComponent, {
      width: '60vw', height: '80vh', data: {
        content: message,
      }
    });
  }

  buddyMessageDialog(message): void {
    this.dialog.open(BuddyMessageDialogComponent, {
      width: '60vw', height: '80vh', data: {
        content: message,
      }
    });
  }


  disableAccountDialog(email): void {
    this.dialog.open(DisableConfirmationComponent, {
      width: '40vw', height: '50vh', data: {
        user: email,
      }
    });
  }

  buddyUpDialog(email): void {
    this.dialog.open(BuddyUpDialogComponent, {
      width: '40vw', height: '50vh', data: {
        user: email,
      }
    });
  }

  blockedUsersDialog(email): void {
    this.dialog.open(BlockedUsersComponent, {
      width: '40vw', height: '50vh', data: {
        user: email,
      }
    });
  }


}
