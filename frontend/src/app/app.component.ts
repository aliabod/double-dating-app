import {Component, HostListener} from '@angular/core';
import {AuthenticationService} from "./services/authentication.service";
import {Router} from "@angular/router";
import {Observable, Subscription} from "rxjs";
import {SelectorService} from "./state/selector.service";
import {tap} from "rxjs/operators";
import {Store} from "@ngxs/store";
import {GetAllMessages, SetScreenIndex} from "./state/main.state";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Owlove';
  currentUser: Observable<any>;
  currentUser$: Observable<any>;
  authenticated: boolean;
  subscriptions: Subscription[];
  screenSize: number;
  screenIndex: number;
  previousScreenIndex: number;

  constructor(private authenticationService: AuthenticationService, private router: Router, private store: Store) {
    this.currentUser = this.authenticationService.currentUserValue;

    this.currentUser$ = this.store.select(SelectorService.getCurrentUser).pipe(
      tap((data) => {
        if (data) {
          this.currentUser = data;
          if (this.currentUser !== null) {
            this.authenticated = true;
          }
        }

        if (data === null) {
          this.authenticated = false;
        }
      })
    );

    if (this.currentUser !== null) {
      this.authenticated = true;
    }

    this.setScreenSize(window.innerWidth);

    this.subscriptions = new Array<Subscription>();
    this.subscriptions.push(this.currentUser$.subscribe());
  }

  @HostListener('window:resize', ['$event'])
  onResize(event): void {
    this.setScreenSize(event.target.innerWidth);
  }

  setScreenSize(width): void {
    this.screenSize = width;

    if(this.screenSize < 1000) {
      this.screenIndex = 0;
    } else if(this.screenSize >= 1000 && this.screenSize < 1600) {
      this.screenIndex = 1;
    } else {
      this.screenIndex = 2;
    }

    if(this.screenIndex !== this.previousScreenIndex) {
      this.store.dispatch(new SetScreenIndex(this.screenIndex));
      this.previousScreenIndex = this.screenIndex;
    }
  }
}
