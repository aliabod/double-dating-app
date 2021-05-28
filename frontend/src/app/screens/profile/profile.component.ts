import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {first, tap} from "rxjs/operators";
import {UserService} from "../../services/user.service";
import {AuthenticationService} from "../../services/authentication.service";
import {SelectorService} from "../../state/selector.service";
import {GetAllMessages, GetUserDetails} from "../../state/main.state";
import {Observable, Subscription} from "rxjs";
import {Store} from "@ngxs/store";
import {DialogService} from "../../services/dialog.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {COMMA, ENTER} from "@angular/cdk/keycodes";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser: any;
  userDetails$: Observable<any>;
  user: any;
  subscriptions: Subscription[];
  formSubmitted = false;
  userDisabled: boolean;
  profilePic: any;
  pictureUploaded = false;

  profileForm: FormGroup;
  firstnameControl = new FormControl('', [Validators.required]);
  lastnameControl = new FormControl('', [Validators.required]);
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  genderControl = new FormControl('');
  interestControl = new FormControl('');
  dobControl = new FormControl('');
  aboutControl = new FormControl('');
  locationControl = new FormControl('', [Validators.pattern('([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\\s?[0-9][A-Za-z]{2})')]);
  interestsControl = new FormControl('');

  interests = [];
  selectable = true;
  removable = true;
  addOnBlur = true;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private formBuilder: FormBuilder,
              private userService: UserService,
              private authenticationService: AuthenticationService,
              private store: Store,
              private dialogService: DialogService,
              private _snackBar: MatSnackBar) {

    this.currentUser = this.authenticationService.currentUserValue;

    if (!this.currentUser) {
      location.href = '/';
    }

    this.profileForm = this.formBuilder.group({
      first_name: this.firstnameControl,
      last_name: this.lastnameControl,
      email: this.emailControl,
      gender: this.genderControl,
      interest: this.interestControl,
      dob: this.dobControl,
      about: this.aboutControl,
      location: this.locationControl,
      interests: this.interestsControl,
    });

    this.userDetails$ = this.store.select(SelectorService.getUserDetails).pipe(
      tap((result) => {
        if (result) {
          if (result !== null) {
            this.user = result;
            this.firstnameControl.setValue(this.user.first_name);
            this.lastnameControl.setValue(this.user.last_name);
            this.emailControl.setValue(this.user.email);

            if (result.gender) {
              this.genderControl.setValue(this.user.gender);
            }

            if (result.interest) {
              this.interestControl.setValue(this.user.interest);
            }

            if (result.dob) {
              this.dobControl.setValue(this.user.dob);
            }

            if (result.about) {
              this.aboutControl.setValue(this.user.about);
            }

            if (result.location) {
              this.locationControl.setValue(this.user.location);
            }

            if (result.interests) {
              this.interests = this.user.interests;
            }

            if (result.disabled) {
              this.userDisabled = true;
            } else {
              this.userDisabled = false;
            }

          }
        }
      })
    );

    this.store.dispatch(new GetUserDetails(this.currentUser));

    this.subscriptions = new Array<Subscription>();
    this.subscriptions.push(this.userDetails$.subscribe());
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions = null;
  }

  onSelectedFilesChanged(file) {
    const myReader: FileReader = new FileReader();
    myReader.onloadend = (e) => {
      this.profilePic = myReader.result;
      this.pictureUploaded = true;
    };

    myReader.readAsDataURL(file[0]);
  }

  async submitForm(formData) {
    if (!this.profileForm.valid) {
      return;
    }

    formData.interests = this.interests;

    if (this.pictureUploaded) {
      this.userService
        .updateDetails(formData, this.profilePic)
        .pipe(first())
        .subscribe(
          (data) => {
            if (data !== null) {
              let snackBarRef = this._snackBar.open('Details has been updated!', 'OK', {
                duration: 3000
              });
              this.store.dispatch(new GetUserDetails(this.currentUser));
            }
          }
        );
    } else {
      if (this.profilePic === undefined) {
        this.userService
          .updateDetails(formData, '')
          .pipe(first())
          .subscribe(
            (data) => {
              if (data !== null) {
                let snackBarRef = this._snackBar.open('Details has been updated!', 'OK', {
                  duration: 3000
                });
                this.store.dispatch(new GetUserDetails(this.currentUser));
              }
            }
          );
      }
    }
  }


  disableAccount(): void {
    this.dialogService.disableAccountDialog(this.currentUser.user);
  }

  async enableAccount() {
    this.userService
      .enableAccount(this.currentUser.user)
      .pipe(first())
      .subscribe(
        (data) => {
          if (data !== null) {
            this.userDisabled = false;
            this.store.dispatch(new GetUserDetails(this.currentUser));
          }
        }
      );
  }

  blockedUsers(): void {
    this.dialogService.blockedUsersDialog(this.currentUser.user);
  }

  buddyUp(): void {
    this.dialogService.buddyUpDialog(this.currentUser.user);
  }

  remove(element): void {
    const elementIndex = this.interests.indexOf(element);

    if (elementIndex !== -1) {
      this.interests.splice(elementIndex, 1);
    }
  }

  add(event): void {
    console.log(event);
    if (event.value.trim()) {
      this.interests.push(event.value.trim());
      event.input.value = '';
    }
  }

}
