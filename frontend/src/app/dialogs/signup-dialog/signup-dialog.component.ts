import {Component, OnInit} from '@angular/core';
import {Form, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from "rxjs";
import {first, tap} from "rxjs/operators";
import {DialogService} from "../../services/dialog.service";
import {RegisterService} from "../../services/register.service";

@Component({
  selector: 'app-signup-dialog',
  templateUrl: './signup-dialog.component.html',
  styleUrls: ['./signup-dialog.component.css']
})
export class SignupDialogComponent implements OnInit {
  signupForm: FormGroup;
  firstnameControl = new FormControl('', [Validators.required]);
  lastnameControl = new FormControl('', [Validators.required]);
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  passwordControl = new FormControl('', [Validators.required, Validators.minLength(5)]);
  password2Control = new FormControl('', [Validators.required, Validators.minLength(5)]);

  userRegistered = false;
  registerError = false;
  profilePic: any;
  pictureUploaded = false;
  pictureError = false;
  passwordError = false;

  constructor(private formBuilder: FormBuilder,
              private http: HttpClient,
              private dialogService: DialogService,
              private registerService: RegisterService) {
    this.signupForm = this.formBuilder.group({
      first_name: this.firstnameControl,
      last_name: this.lastnameControl,
      email: this.emailControl,
      password: this.passwordControl,
      password2: this.password2Control
    });
  }

  ngOnInit(): void {
  }

  matchPassword(group: FormGroup): any { // here we have the 'passwords' group
    const password = group.get('password').value;
    const password2 = group.get('password2').value;
    return password === password2 ? {notSame: false} : {notSame: true};
  }

  onSelectedFilesChanged(file) {
    const myReader: FileReader = new FileReader();
    myReader.onloadend = (e) => {
      this.profilePic = myReader.result;
      this.pictureUploaded = true;
    };
    if(file && file[0]) {
      myReader.readAsDataURL(file[0]);
    } else {
      this.pictureUploaded = false;
      this.profilePic = null;
    }
  }

  async submitForm(formData) {
    if (!this.signupForm.valid) {
      return;
    }

    if(formData.password !== formData.password2) {
      console.log('Not valid!');
      this.passwordError = true;
      return;
    }

    this.passwordError = false;

    if (this.pictureUploaded) {
      this.registerService
        .registerUser(formData, this.profilePic)
        .pipe(first())
        .subscribe(
          (data) => {
            if (data !== null) {
              if (data.status === 'OK') {
                this.registerError = false;
                this.userRegistered = true;
              } else if (data.status === 'Error' && data.code === 1) {
                this.registerError = true;
              }
            }
          }
        );
    } else {
      this.pictureError = true;
    }
  }

  loginDialog(): void {
    this.dialogService.loginDialog();
  }
}
