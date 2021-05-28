import {Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {first, tap} from "rxjs/operators";
import {MessageService} from "../../services/message.service";
import {AuthenticationService} from "../../services/authentication.service";
import {GetAllMessages, GetMessages, SendMessage} from "../../state/main.state";
import {Store} from "@ngxs/store";
import {Observable, Subscription} from "rxjs";
import {SelectorService} from "../../state/selector.service";
import {InteractionService} from "../../services/interaction.service";
import {UserService} from "../../services/user.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {webSocket} from "rxjs/webSocket";

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.css']
})
export class MessageDialogComponent implements OnInit, OnDestroy {
  messageData: any;

  messages = [];

  messageForm: FormGroup;
  messageControl = new FormControl('');
  currentUser: any;
  subscriptions: Subscription[];
  userPicture: string;

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
    this.messageForm = this.formBuilder.group({
      message: this.messageControl,
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authenticationService.currentUserValue;
    this.store.dispatch(new GetMessages(this.messageData.content.email));

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

    this.messages$ = this.store.select(SelectorService.getMessages).pipe(
      tap((data) => {
        if (data) {
          this.messages = [];
          for (const element of data) {
            this.messages.push({
              id: this.messages.length + 1,
              sender: (element.from === this.currentUser.user ? 1 : 0),
              content: element.content,
              date: element.date
            });
          }

          setTimeout(() => {
            this.updateScroll();
          }, 250);
        }
      })
    );

    const subject = webSocket('ws://localhost:8080/message/' + this.currentUser.user);

    subject.subscribe(
      msg => {
        if (msg === 1) {
          setTimeout(() => {
            this.store.dispatch(new GetMessages(this.messageData.content.email));
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
        from: this.currentUser.user,
        to: this.messageData.content.email,
        date: Date.now(),
        content: formData.message,
        match_id: this.messageData.content.match_id
      };
      this.store.dispatch(new SendMessage(message));

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
