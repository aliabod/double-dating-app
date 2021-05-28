import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {LabelType, Options} from "@angular-slider/ngx-slider";
import {AuthenticationService} from "../../services/authentication.service";
import {Store} from "@ngxs/store";
import {UserService} from "../../services/user.service";
import {InteractionService} from "../../services/interaction.service";
import {SelectorService} from "../../state/selector.service";
import {first, tap} from "rxjs/operators";

@Component({
  selector: 'app-explore-buddy-up',
  templateUrl: './explore-buddy-up.component.html',
  styleUrls: ['./explore-buddy-up.component.css']
})
export class ExploreBuddyUpComponent implements OnInit {
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
  buddyId: string;

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
        this.buddyId = r.buddyUpID;
        if (this.buddyId) {
          this.onFilterChange();
        }
      });

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
    this.userService.fetchBuddies(this.filterAgeMin, this.filterAgeMax, this.filterDistance, this.buddyId).pipe(first())
      .subscribe(
        (data) => {
          if (data) {
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
    this.interactionService.likeBuddy(this.buddyId, target).pipe(first())
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
    this.interactionService.dislikeBuddy(this.buddyId, target).pipe(first())
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
    this.interactionService.superlikeBuddy(this.buddyId, target).pipe(first())
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

