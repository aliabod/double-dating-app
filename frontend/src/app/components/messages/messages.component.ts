import {Component, OnDestroy, OnInit} from '@angular/core';
import {DialogService} from '../../services/dialog.service';
import {Store} from "@ngxs/store";
import {GetAllMessages, GetMessages} from "../../state/main.state";
import {SelectorService} from "../../state/selector.service";
import {catchError, first, map, tap} from "rxjs/operators";
import {Observable, Subscription} from "rxjs";
import {AuthenticationService} from "../../services/authentication.service";
import {UserService} from "../../services/user.service";
import {InteractionService} from "../../services/interaction.service";
import {DataService} from "../../services/data.service";
import {webSocket} from "rxjs/webSocket";

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, OnDestroy {
  messages = [];
  messages$: Observable<any>;
  subscriptions: Subscription[];
  currentUser: any;
  currentUser$: Observable<any>;
  liveData$;
  messagesLoading$: Observable<any>;

  buddyMessages = [];
  newMatches = false;
  newBuddyMatches = false;
  matches = [];
  buddyMatches = [];
  buddyId: string;

  constructor(private dialogService: DialogService,
              private store: Store,
              private authenticationService: AuthenticationService,
              private userService: UserService,
              private interactionService: InteractionService,
              private dataService: DataService) {
    this.currentUser = this.authenticationService.currentUserValue;

    const subject = webSocket('ws://localhost:8080/messages/' + this.currentUser.user);


    setInterval(() => {
      this.store.dispatch(new GetAllMessages(this.currentUser.user));
    }, 60000);

    subject.subscribe(
      msg => {
        console.log(msg);
        if (msg === 1) {
          this.store.dispatch(new GetAllMessages(this.currentUser.user));
        }
      }, // Called whenever there is a message from the server.
      err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
      () => console.log('complete') // Called when connection is closed (for whatever reason).
    );

    this.currentUser$ = this.store.select(SelectorService.getCurrentUser).pipe(
      tap((data) => {
        if (data) {
          this.currentUser = data;
          this.store.dispatch(new GetAllMessages(this.currentUser.user));
          this.messages = [];
        }
      })
    );

    if (this.currentUser !== null) {
      this.store.dispatch(new GetAllMessages(this.currentUser.user));
    }

    this.messagesLoading$ = this.store.select(SelectorService.getMessageLoading);

    this.messages$ = this.store.select(SelectorService.getAllMessages).pipe(
      tap((data) => {
        if (data) {
          const msgs = [];
          const buddyMsgs = []
          for (const message of data) {
            if(message.type === 'personal') {
              const user = (message.content.from === this.currentUser.user ? message.content.to : message.content.from);
              this.userService
                .fetch(user)
                .pipe(first())
                .subscribe(
                  (result) => {
                    if (result !== null) {
                      let msgStr = '';

                      if (message.content.content.length > 80) {
                        msgStr = message.content.content.substring(0, 80) + '...';
                      } else {
                        msgStr = message.content.content;
                      }
                      const msg = {
                        id: this.messages.length + 1,
                        name: result.first_name + ' ' + result.last_name,
                        picture: result.picture,
                        message: msgStr,
                        email: user
                      };
                      msgs.push(msg);
                    } else {
                      const msg = {
                        id: this.messages.length + 1,
                        name: 'User deleted',
                        picture: 'https://via.placeholder.com/100x100',
                        message: message.content.content,
                        email: user
                      };
                      msgs.push(msg);
                    }
                  }
                );
            } else if (message.type === 'buddy') {
              const msgDetails = {buddyId: message.buddyId, source: message.source, users: message.buddyDetails, message: message.content.content, matchId: null, thisBuddy: message.thisBuddy};

              buddyMsgs.push(msgDetails);
            }
          }
          this.messages = msgs;
          this.buddyMessages = buddyMsgs;
          this.interactionService.getMatches(this.currentUser.user).pipe(first())
            .subscribe(
              (d) => {
                if (d) {
                  const matchList = [];
                  this.newMatches = false;
                  for (const e of d.msg) {
                    if (e.status === 0) {
                      const matchedUser = (e.users[0] === this.currentUser.user ? e.users[1] : e.users[0]);

                      this.userService
                        .fetch(matchedUser)
                        .pipe(first())
                        .subscribe(
                          (result) => {
                            if (result !== null) {
                              const match = {
                                id: this.matches.length + 1,
                                name: result.first_name + ' ' + result.last_name,
                                picture: result.picture,
                                message: 'Start a conversation...',
                                email: matchedUser,
                                match_id: e._id
                              };
                              matchList.push(match);
                              this.newMatches = true;
                              this.matches = matchList;
                            }
                          }
                        );
                    }
                  }
                }
              }
            );

          const buddyDetails = this.userService.fetchDetails(this.currentUser.user).pipe(first())
            .subscribe((r) => {
              this.buddyId = r.buddyUpID;
              this.interactionService.getMatchesBuddy(this.buddyId).pipe(first())
                .subscribe(
                  (d) => {
                    if (d) {
                      const matchList = [];
                      this.newBuddyMatches = false;

                      for (const e of d.msg) {
                        if (e.status === 0) {
                          const matchedBuddy = (e.buddies[0] === this.buddyId ? e.buddies[1] : e.buddies[0]);
                          const matchDetails = {buddyId: matchedBuddy, source: this.buddyId, users: [], message: 'Start a conversation...', matchId: e._id};

                          this.userService.fetchBuddyDetails(matchedBuddy).pipe(first())
                            .subscribe(matchData => {
                              matchDetails.users = matchData.userDetails;
                              matchList.push(matchDetails);
                              this.newBuddyMatches = true;
                              if (this.newBuddyMatches) {
                                this.buddyMatches = matchList;
                              }
                            });
                        }
                      }

                    }
                  }
                );
            });
        }
      })
    );


    this.subscriptions = new Array<Subscription>();
    this.subscriptions.push(this.messages$.subscribe());
    this.subscriptions.push(this.currentUser$.subscribe());
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions = null;
  }

  openMessage(message): void {
    this.dialogService.messageDialog(message);
  }

  openBuddyMessage(message): void {
    this.dialogService.buddyMessageDialog(message);
  }
}
