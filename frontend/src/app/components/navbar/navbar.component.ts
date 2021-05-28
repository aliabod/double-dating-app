import {Component, OnInit} from '@angular/core';
import {DialogService} from '../../services/dialog.service';
import {AuthenticationService} from "../../services/authentication.service";
import {Observable, Subscription} from "rxjs";
import {Router} from "@angular/router";
import {SelectorService} from "../../state/selector.service";
import {first, tap} from "rxjs/operators";
import {Store} from "@ngxs/store";
import {Login} from "../../state/main.state";
import {UserService} from "../../services/user.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  currentUser: Observable<any>;
  currentUser$: Observable<any>;
  screenIndex: number;
  screenIndex$: Observable<any>;
  subscriptions: Subscription[];

  displayLogin = true;
  displayBuddy = true;

  constructor(private dialogService: DialogService, private authenticationService: AuthenticationService, private userService: UserService, private router: Router, private store: Store) {
  }

  ngOnInit(): void {
    this.currentUser = this.authenticationService.currentUserValue;

    this.currentUser$ = this.store.select(SelectorService.getCurrentUser).pipe(
      tap((data) => {
        if (data) {
          this.currentUser = data;
          if (this.currentUser !== null) {
            this.displayLogin = false;
          }
        }

        if (data === null) {
          this.displayLogin = true;
        }
      })
    );

    this.screenIndex$ = this.store.select(SelectorService.getScreenIndex).pipe(
      tap((data) => {
        this.screenIndex = data;
      })
    );

    if (this.currentUser !== null) {
      this.displayLogin = false;
      this.userService
        .getBuddyStatus(this.currentUser)
        .pipe(first())
        .subscribe(
          (d) => {
            if (d) {
              this.displayBuddy = d.buddyStatus;
            }
          }
        );
    }

    this.subscriptions = new Array<Subscription>();
    this.subscriptions.push(this.currentUser$.subscribe());
    this.subscriptions.push(this.screenIndex$.subscribe());
  }

  loginDialog(): void {
    this.dialogService.loginDialog();
  }

  signupDialog(): void {
    this.dialogService.signupDialog();
  }

  logout(): void {
    this.authenticationService.logout();
    this.router.navigate(['/home']);
    this.store.dispatch(new Login(null));
  }
}
