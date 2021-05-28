import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {first, tap} from "rxjs/operators";
import {MessageService} from "../../services/message.service";
import {AuthenticationService} from "../../services/authentication.service";
import {GetAllMessages, GetBuddyMessages, GetMessages, SendBuddyMessage, SendMessage} from "../../state/main.state";
import {Store} from "@ngxs/store";
import {Observable, Subscription} from "rxjs";
import {SelectorService} from "../../state/selector.service";
import {InteractionService} from "../../services/interaction.service";
import {UserService} from "../../services/user.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {webSocket} from "rxjs/webSocket";

@Component({
  selector: 'app-buddy-message-dialog',
  templateUrl: './buddy-message-dialog.component.html',
  styleUrls: ['./buddy-message-dialog.component.css']
})
export class BuddyMessageDialogComponent implements OnInit {

  messageData: any;

  messages = [];

  messageForm: FormGroup;
  messageControl = new FormControl('');
  currentUser: any;
  subscriptions: Subscription[];
  userPicture: string;
  users: any;
  usersDetails = [];
  buddy: string;

  messages$: Observable<any>;
  @ViewChild('messageContainer') messagesContainer: ElementRef;

  constructor(@Inject(MAT_DIALOG_DATA) private injectedData: any,
              private formBuilder: FormBuilder,
              private messageService: MessageService,
              private authenticationService: AuthenticationService,
              private store: Store,
              private userService: UserService,
              private _snackBar: MatSnackBar) {
    this.messageData = injectedData;
    this.users = new Set();

    this.messageForm = this.formBuilder.group({
      message: this.messageControl,
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authenticationService.currentUserValue;
    const payload = {source: this.messageData.content.source, target: this.messageData.content.buddyId};

    this.userService
      .fetch(this.currentUser.user)
      .pipe(first())
      .subscribe(
        (result) => {
          if (result !== null) {
            this.userPicture = result.picture;
          }
        }
      );

    this.messages$ = this.store.select(SelectorService.getBuddyMessages).pipe(
      tap((data) => {
        if (data) {
          data.sort((a, b) => {
            if (a.date === b.date) {
              return 0;
            }
            if (a.date > b.date) {
              return 1;
            } else {
              return -1;
            }
          });

          this.messages = [];

          for (const element of data) {
            if (!this.users.has(element.from)) {
              this.userService.fetchDetails(element.from).pipe(first())
                .subscribe(
                  (d) => {
                    this.users.add(element.from);
                    this.usersDetails.push({email: element.from, picture: d.picture});
                    const sender = this.messageData.content.thisBuddy.includes(element.from);
                    this.messages.push({
                      id: this.messages.length + 1,
                      sender: (sender ? 1 : 0),
                      buddySender: (element.from !== this.currentUser.user && sender ? 1 : 0),
                      senderPicture: d.picture,
                      content: element.content,
                      date: element.date
                    });
                  }
                );
            } else {
              const sender = this.messageData.content.thisBuddy.includes(element.from);
              this.messages.push({
                id: this.messages.length + 1,
                sender: (sender ? 1 : 0),
                buddySender: (element.from !== this.currentUser.user && sender ? 1 : 0),
                senderPicture: this.usersDetails.find((e) => e.email === element.from).picture,
                content: element.content,
                date: element.date
              });
            }
          }
          setTimeout(() => {
            this.updateScroll();
          }, 250);
        }
      })
    );

    setTimeout(() => {
      const payloadWS = {source: this.messageData.content.source, target: this.messageData.content.buddyId};
      this.store.dispatch(new GetBuddyMessages(payloadWS));
    }, 250);

    const subject = webSocket('ws://localhost:8080/message/' + this.currentUser.user);

    subject.subscribe(
      msg => {
        if (msg === 1) {
          setTimeout(() => {
            const payloadWS = {source: this.messageData.content.source, target: this.messageData.content.buddyId};
            this.store.dispatch(new GetBuddyMessages(payloadWS));
          }, 250);
        }
      }, // Called whenever there is a message from the server.
      err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
      () => console.log('complete') // Called when connection is closed (for whatever reason).
    );


    this.subscriptions = new Array<Subscription>();
    this.subscriptions.push(this.messages$.subscribe());
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions = null;
  }

  async submitForm(formData) {
    if (!this.messageForm.valid) {
      return;
    }

    if (formData.message === '' || formData.message === null) {
      return;
    }

    if (this.currentUser !== null) {
      const message = {
        fromBuddy: this.messageData.content.source,
        toBuddy: this.messageData.content.buddyId,
        from: this.currentUser.user,
        date: Date.now(),
        content: formData.message,
        matchId: this.messageData.content.matchId
      };
      this.store.dispatch(new SendBuddyMessage(message));

      this.messageForm.reset('', {emitEvent: false});
    }
  }

  updateScroll(): void {
    this.messagesContainer.nativeElement.scrollTo({
      top: this.messagesContainer.nativeElement.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }

  blockUser(targetUser): void {
    this.userService.blockUser(this.currentUser.user, targetUser).subscribe(
      (data) => {
        if (data) {
          if(data.status === 'OK') {
            let snackBarRef = this._snackBar.open(data.msg, 'OK', {
              duration: 3000
            });

            this.store.dispatch(new GetAllMessages(this.currentUser.user));
          } else {
            let snackBarRef = this._snackBar.open(data.msg, 'OK', {
              duration: 3000
            });
          }
        }
      }
    );
  }
}
