import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {AuthenticationService} from "../../services/authentication.service";
import {Router} from "@angular/router";
import { first } from 'rxjs/operators';
import {MatDialogRef} from "@angular/material/dialog";
import {Store} from "@ngxs/store";
import {GetAllMessages, Login} from "../../state/main.state";


@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.css']
})
export class LoginDialogComponent implements OnInit {

  loginForm: FormGroup;
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  passwordControl = new FormControl('', [Validators.required, Validators.minLength(5)]);
  userAuthenticated = false;
  loginError = false;

  constructor(private formBuilder: FormBuilder,
              private http: HttpClient,
              private authenticationService: AuthenticationService,
              private router: Router,
              private dialogRef: MatDialogRef<any>,
              private store: Store) {
    this.loginForm = this.formBuilder.group({
      email: this.emailControl,
      password: this.passwordControl,
    });

    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/user']);
    }
  }

  ngOnInit(): void {
  }

  async submitForm(formData) {
    if (!this.loginForm.valid) {
      return;
    }

    const email = formData.email;
    const password = formData.password;
    this.authenticationService
      .login(email, password)
      .pipe(first())
      .subscribe(
        (data) => {
          if (data !== null) {
            this.dialogRef.close();
            window.location.reload();
          } else {
            this.loginError = true;
          }
        }
      );
  }

}
