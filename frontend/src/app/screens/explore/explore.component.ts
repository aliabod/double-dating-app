import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {LabelType, Options} from '@angular-slider/ngx-slider';
import {SelectorService} from "../../state/selector.service";
import {first, tap} from "rxjs/operators";
import {Observable, Subscription} from "rxjs";
import {AuthenticationService} from "../../services/authentication.service";
import {Store} from "@ngxs/store";
import {UserService} from "../../services/user.service";
import {GetUserDetails} from "../../state/main.state";
import {InteractionService} from "../../services/interaction.service";

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {
  filterAgeMin = 18;
  filterAgeMax = 99;
  filterDistance = 20;

  currentUser: any;
  currentUser$: Observable<any>;
  subscriptions: Subscription[];
  scrollCount = 0;
  people = [];
  allPeople = [];
  error = false;
  interests: any;
  isDisabled: boolean;

  valueAge = 18;
  highValueAge = 99;
  optionsAge: Options = {
    floor: 18,
    ceil: 99,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          return 'Older than ' + value;
        case LabelType.High:
          return 'But younger than ' + value;
        default:
          return value + ' yo';
      }
    }
  };

  valueDistance = 20;
  optionsDistance: Options = {
    floor: 1,
    ceil: 150,
    showSelectionBar: true,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          return '<' + value + ' km';
        default:
          return value + ' km';
      }
    },
    selectionBarGradient: {
      from: '#98def5',
      to: '#0db9f0'
    }
  };

  @ViewChild('peopleContainer') peopleContainer: ElementRef;

  constructor(private authenticationService: AuthenticationService, private store: Store, private userService: UserService, private interactionService: InteractionService) {
    this.currentUser = this.authenticationService.currentUserValue;

    this.currentUser$ = this.store.select(SelectorService.getCurrentUser).pipe(
      tap((data) => {
        if (data) {
          this.currentUser = data;
        }
      })
    );

    const currentUserDetails = this.userService.fetchDetails(this.currentUser.user).pipe(first())
      .subscribe((r) => {
        this.interests = r.interests;
        this.isDisabled = r.disabled;
      });


    this.onFilterChange();

    this.subscriptions = new Array<Subscription>();
    this.subscriptions.push(this.currentUser$.subscribe());
  }

  ngOnInit(): void {
  }


  ageFilter(val): void {
    this.filterAgeMin = val.value;
    this.filterAgeMax = val.highValue;
  }

  distanceFilter(val): void {
    this.filterDistance = val.value;
  }

  onFilterChange(): void {
    this.userService.fetchUsers(this.filterAgeMin, this.filterAgeMax, this.filterDistance, this.currentUser.user).pipe(first())
      .subscribe(
        (data) => {
          if (data) {
            for (const entry of data) {
              const index = data.indexOf(entry);
              const details = this.userService.fetchDetails(entry.email).pipe(first())
                .subscribe((r) => {
                  const interests = {common: [], notCommon: []};
                  for (const interest of r.interests) {
                    if (this.interests.findIndex((e) => e.toLowerCase() === interest.toLowerCase()) !== -1) {
                      interests.common.push(interest);
                    } else {
                      interests.notCommon.push(interest);
                    }
                  }

                  if (interests.common.length >= 5) {
                    interests.common = interests.common.slice(0, 5);
                    interests.notCommon = [];
                  } else {
                    const diff = 5 - interests.common.length;
                    interests.notCommon = interests.notCommon.slice(0, diff);
                  }
                  data[index].interests = interests;
                });
            }
            this.error = false;
            this.allPeople = data;
            this.scrollCount = 0;
            this.people = data.slice(0, 12);
            this.peopleContainer.nativeElement.scrollTo({
              top: 0,
              left: 0,
              behavior: 'smooth'
            });

          } else {
            this.error = true;
          }
        }
      );
  }

  like(target): void {
    this.interactionService.like(this.currentUser.user, target).pipe(first())
      .subscribe(
        (data) => {
          if (data !== null) {
            this.allPeople.splice(this.allPeople.indexOf(this.allPeople.find((e) => e.email === target)), 1);
            this.people = this.allPeople.slice(0, this.scrollCount * 12 + 12);
          }
        }
      );
  }

  dislike(target): void {
    this.interactionService.dislike(this.currentUser.user, target).pipe(first())
      .subscribe(
        (data) => {
          if (data !== null) {
            this.allPeople.splice(this.allPeople.indexOf(this.allPeople.find((e) => e.email === target)), 1);
            this.people = this.allPeople.slice(0, this.scrollCount * 12 + 12);
          }
        }
      );
  }

  superlike(target): void {
    this.interactionService.superlike(this.currentUser.user, target).pipe(first())
      .subscribe(
        (data) => {
          if (data !== null) {
            this.allPeople.splice(this.allPeople.indexOf(this.allPeople.find((e) => e.email === target)), 1);
            this.people = this.allPeople.slice(0, this.scrollCount * 12 + 12);
          }
        }
      );
  }

  onScroll(): void {
    this.scrollCount++;
    this.people = this.people.concat(this.allPeople.slice(this.scrollCount * 12, (this.scrollCount * 12) + 12));
  }
}
