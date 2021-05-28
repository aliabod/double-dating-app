import { Component, OnInit } from '@angular/core';
import {SelectorService} from "../../state/selector.service";
import {first, tap} from "rxjs/operators";
import {AuthenticationService} from "../../services/authentication.service";
import {Store} from "@ngxs/store";
import {Observable} from "rxjs";
import {UserService} from "../../services/user.service";
import {GetUserDetails} from "../../state/main.state";
import {InteractionService} from "../../services/interaction.service";

@Component({
  selector: 'app-home-screen',
  templateUrl: './home-screen.component.html',
  styleUrls: ['./home-screen.component.css']
})
export class HomeScreenComponent implements OnInit {
  currentUser: any;
  authenticated = false;
  targetUser = '';
  person: any;
  userFetched = false;
  hasRecommendations = true;
  isDisabled: boolean;
  interests = {common: [], notCommon: []};

  constructor(private authenticationService: AuthenticationService, private store: Store, private userService: UserService, private interactionService: InteractionService) {
    this.currentUser = this.authenticationService.currentUserValue;

    this.userService.fetchDetails(this.currentUser.user).pipe(first())
      .subscribe((data) => {
        this.isDisabled = data.disabled;
      })

    this.refreshRecommendation();
  }

  ngOnInit(): void {
  }

  refreshRecommendation(): void {
    this.interests = {common: [], notCommon: []};
    this.userFetched = false;
    if (this.currentUser && this.currentUser.user) {
      this.authenticated = true;
      this.userService
        .getRecommendation(this.currentUser.user)
        .pipe(first())
        .subscribe(
          (data) => {
            if (data) {
              if(typeof data === "string") {
                this.hasRecommendations = false;
              } else {
                this.hasRecommendations = true;
                this.userService
                  .fetchDetails(data.email)
                  .pipe(first())
                  .subscribe(
                    (dat) => {
                      if (dat) {
                        this.person = dat;
                        const now = new Date();
                        const dob = new Date(dat.dob);
                        // @ts-ignore
                        this.person.age = Math.floor((now - dob) / 365.242 / 24 / 60 / 60 / 1000);
                        this.userFetched = true;
                        this.userService.fetchDetails(this.currentUser.user)
                          .pipe(first())
                          .subscribe(
                            (userData) => {
                              for(const interest of this.person.interests) {
                                const present = userData.interests.findIndex((e) => {
                                  return e.toLowerCase() === interest.toLowerCase();
                                });
                                if(present !== -1) {
                                  this.interests.common.push(interest);
                                } else {
                                  this.interests.notCommon.push(interest);
                                }
                              }
                            }
                          );
                      }
                    }
                  );
              }
            }
          }
        );
    } else {
      this.authenticated = false;
    }
  }

  like(target): void {
    this.interactionService.like(this.currentUser.user, target).pipe(first())
      .subscribe(
        (data) => {
          if (data !== null) {
            this.refreshRecommendation();
          }
        }
      );
  }

  dislike(target): void {
    this.interactionService.dislike(this.currentUser.user, target).pipe(first())
      .subscribe(
        (data) => {
          if (data !== null) {
            this.refreshRecommendation();
          }
        }
      );
  }

  superlike(target): void {
    this.interactionService.superlike(this.currentUser.user, target).pipe(first())
      .subscribe(
        (data) => {
          if (data !== null) {
            this.refreshRecommendation();
          }
        }
      );
  }

}
