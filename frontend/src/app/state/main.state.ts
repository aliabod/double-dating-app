import { Time } from '@angular/common';
import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { mergeMap, tap } from 'rxjs/operators';
import { StateModel } from '../models/state.model';
import {MessageService} from "../services/message.service";
import {UserService} from "../services/user.service";

export const StarterData: StateModel = {
  messages: {},
  userDetails: {},
  config: {}
};

export class GetMessages {
  static readonly type = 'GET_MESSAGES';
  constructor(public targetUser: any) {}
}

export class GetAllMessages {
  static readonly type = 'GET_ALL_MESSAGES';
  constructor(public currentUser: any) {}
}

export class SendMessage {
  static readonly type = 'SEND_MESSAGE';
  constructor(public message: any) {}
}

export class GetBuddyMessages {
  static readonly type = 'GET_BUDDY_MESSAGES';
  constructor(public users: any) {}
}

export class GetAllBuddyMessages {
  static readonly type = 'GET_ALL_BUDDY_MESSAGES';
  constructor(public currentUser: any) {}
}

export class SendBuddyMessage {
  static readonly type = 'SEND_BUDDY_MESSAGE';
  constructor(public message: any) {}
}

export class Login {
  static readonly type = 'LOGIN';
  constructor(public user: any) {}
}

export class GetUserDetails {
  static readonly type = 'GET_USER_DETAILS';
  constructor(public targetUser: any) {}
}

export class SetScreenIndex {
  static readonly type = 'SET_SCREEN_INDEX';
  constructor(public screenIndex: number) {}
}

// sets the default state
@State<StateModel>({
  name: 'data',
  defaults: StarterData,
})

@Injectable()
export class BaseState {
  constructor(
    private messageService: MessageService,
    private userService: UserService
  ) {}

  @Action(SetScreenIndex)
  // tslint:disable-next-line:typedef
  setScreenIndex(
    { patchState, getState }: StateContext<StateModel>,
    { screenIndex }: SetScreenIndex
  ) {
    const state = getState().config;
    const newData = {
      ...state,
      screenIndex,
    };
    patchState({ config: newData });
  }

  @Action(Login)
  // tslint:disable-next-line:typedef
  login(
    { patchState, getState }: StateContext<StateModel>,
    { user }: Login
  ) {
    const state = getState().userDetails;
    const newData = {
      ...state,
      email: user,
    };

    patchState({ userDetails: newData });
  }

  @Action(GetMessages)
  // tslint:disable-next-line:typedef
  getMessages(
    { patchState, getState }: StateContext<StateModel>,
    { targetUser }: GetMessages
  ) {
    const state = getState().messages;
    const newData = {
      ...state,
    };

    patchState({ messages: newData });

    return this.messageService.fetch(targetUser).pipe(
      tap((result) => {
        const updatedData = {
          ...state,
          messagesData: result
        };
        patchState({ messages: updatedData });
      })
    );
  }

  @Action(GetAllMessages)
  // tslint:disable-next-line:typedef
  getAllMessages(
    { patchState, getState }: StateContext<StateModel>,
    { currentUser }: GetAllMessages
  ) {
    const state = getState().messages;
    const newData = {
      ...state,
      isMessageLoading: true,
    };

    patchState({ messages: newData });

    return this.messageService.fetchAll(currentUser).pipe(
      tap((result) => {
        const updatedData = {
          ...state,
          isMessageLoading: false,
          allMessagesData: result
        };
        patchState({ messages: updatedData });
      })
    );
  }

  @Action(SendMessage)
  // tslint:disable-next-line:typedef
  sendMessage(
    { patchState, getState }: StateContext<StateModel>,
    { message }: SendMessage
  ) {
    const state = getState().messages;
    const newData = {
      ...state,
      isMessageLoading: true,
    };

    patchState({ messages: newData });

    return this.messageService.send(message).pipe(
      tap((result) => {
        if (result) {
          const updatedData = {
            ...state,
            isMessageLoading: false,
            messagesData: [...state.messagesData, message]
          };

          patchState({ messages: updatedData });
        }
      })
    );
  }

  @Action(GetBuddyMessages)
  // tslint:disable-next-line:typedef
  getBuddyMessages(
    { patchState, getState }: StateContext<StateModel>,
    { users }: GetBuddyMessages
  ) {
    const state = getState().messages;
    const newData = {
      ...state,
    };

    patchState({ messages: newData });

    return this.messageService.fetchBuddy(users.source, users.target).pipe(
      tap((result) => {
        const updatedData = {
          ...state,
          buddyMessagesData: result
        };

        patchState({ messages: updatedData });
      })
    );
  }

  @Action(SendBuddyMessage)
  // tslint:disable-next-line:typedef
  sendBuddyMessage(
    { patchState, getState }: StateContext<StateModel>,
    { message }: SendBuddyMessage
  ) {
    const state = getState().messages;
    const newData = {
      ...state,
      isMessageLoading: true,
    };

    patchState({ messages: newData });

    return this.messageService.sendBuddy(message).pipe(
      tap((result) => {
        if (result) {
          const updatedData = {
            ...state,
            isMessageLoading: false,
            allMessagesData: [...state.allMessagesData, message]
          };


          patchState({ messages: updatedData });
        }
      })
    );
  }

  @Action(GetUserDetails)
  // tslint:disable-next-line:typedef
  getUserDetails(
    { patchState, getState }: StateContext<StateModel>,
    { targetUser }: GetUserDetails
  ) {
    const state = getState().userDetails;
    const newData = {
      ...state
    };

    patchState({ userDetails: newData });

    return this.userService.fetchDetails(targetUser.user).pipe(
      tap((result) => {
        const updatedData = {
          ...state,
          profile: result
        };
        patchState({ userDetails: updatedData });
      })
    );
  }



}
