import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {UserService} from "../../services/user.service";
import {Store} from "@ngxs/store";
import {AuthenticationService} from "../../services/authentication.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {first} from "rxjs/operators";
import {GetUserDetails} from "../../state/main.state";
import {DialogService} from "../../services/dialog.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-buddy-up-dialog',
  templateUrl: './buddy-up-dialog.component.html',
  styleUrls: ['./buddy-up-dialog.component.css']
})
export class BuddyUpDialogComponent implements OnInit {
  userData: any;
  currentUser: any;
  buddyUpRequests = [];
  buddyUpsRequested = [];
  buddyUpID = '';
  buddyName = '';

  profileForm: FormGroup;
  buddyEmailControl = new FormControl('', [Validators.required, Validators.email]);


  constructor(@Inject(MAT_DIALOG_DATA) private injectedData: any,
              private userService: UserService,
              private store: Store,
              private authenticationService: AuthenticationService,
              private formBuilder: FormBuilder,
              private _snackBar: MatSnackBar,
              public dialogRef: MatDialogRef<BuddyUpDialogComponent>) {
    this.userData = injectedData.user;
    this.currentUser = this.authenticationService.currentUserValue;

    this.profileForm = this.formBuilder.group({
      buddyEmail: this.buddyEmailControl,
    });
  }

  ngOnInit(): void {
    this.userService.fetchDetails(this.userData)
      .pipe(first())
      .subscribe(
        (data) => {
          this.buddyUpID = data.buddyUpID;
          if(this.buddyUpID) {
            this.userService
              .getBuddyDetails(this.buddyUpID)
              .pipe(first())
              .subscribe(
                (d) => {
                  this.buddyName = (d.userDetails[0].email === this.currentUser.user ? d.userDetails[1].name : d.userDetails[0].name);
                }
              );
          }
        }
      );

    this.userService
      .getBuddyRequest(this.userData)
      .pipe(first())
      .subscribe(
        (data) => {
          const requests = data.msg;
          console.log(requests);
          for (const request of requests) {
            this.userService
              .getBuddyDetails(request._id)
              .pipe(first())
              .subscribe(
                (d) => {
                  const newRequest = {name: '', email: '', request: request};
                  if (d.userDetails[0].email === this.currentUser.user) {
                    newRequest.name = d.userDetails[1].name;
                    newRequest.email = d.userDetails[1].email;
                  } else {
                    newRequest.name = d.userDetails[0].name;
                    newRequest.email = d.userDetails[0].email;
                  }

                  if (request.requestedBy !== this.userData) {
                    this.buddyUpRequests.push(newRequest);
                  } else {
                    this.buddyUpsRequested.push(newRequest);
                  }
                }
              );
          }
        }
      );
  }

  async submitForm(formData) {
    if (!this.profileForm.valid) {
      return;
    }

    formData.requestedBy = this.userData;
    this.userService
      .setBuddy(formData)
      .pipe(first())
      .subscribe(
        (data) => {
          if (data.status === 'OK') {
            let snackBarRef = this._snackBar.open('Buddy up has been requested!', 'OK', {
              duration: 3000
            });
            this.dialogRef.close();
          } else {
            let snackBarRef = this._snackBar.open('Error! ' + data.msg, 'OK', {
              duration: 3000
            });
          }
          this.ngOnInit();
        }
      );
  }

  async acceptBuddy(source) {
    const data = {source: source, target: this.userData};

    this.userService
      .acceptBuddyUp(data)
      .pipe(first())
      .subscribe(
        (data) => {
          if (data.status === 'OK') {
            let snackBarRef = this._snackBar.open('Buddy up has been accepted!', 'OK', {
              duration: 3000
            });
            this.dialogRef.close();
            setTimeout(() => window.location.reload(), 1000);
          } else {
            let snackBarRef = this._snackBar.open('Error! ' + data.msg, 'OK', {
              duration: 3000
            });
          }
        }
      );
  }

  cancelBuddy(buddyID) {
    this.userService
      .cancelBuddyUp(buddyID)
      .pipe(first())
      .subscribe(
        (data) => {
          if (data.status === 'OK') {
            let snackBarRef = this._snackBar.open('Buddy up has been deleted!', 'OK', {
              duration: 3000
            });
            setTimeout(() => window.location.reload(), 1000);
            this.dialogRef.close();

          } else {
            let snackBarRef = this._snackBar.open('Error! ' + data.msg, 'OK', {
              duration: 3000
            });
          }
        }
      );
  }

  cancelRequest(buddyUpID) {
    this.userService
      .cancelBuddyUpRequest(buddyUpID)
      .pipe(first())
      .subscribe(
        (data) => {
          if (data.status === 'OK') {
            let snackBarRef = this._snackBar.open('Buddy up has been cancelled!', 'OK', {
              duration: 3000
            });
            this.buddyUpsRequested.splice(this.buddyUpsRequested.findIndex((e) => e.request._id === buddyUpID), 1);
          } else {
            let snackBarRef = this._snackBar.open('Error! ' + data.msg, 'OK', {
              duration: 3000
            });
          }
        }
      );
  }

}
