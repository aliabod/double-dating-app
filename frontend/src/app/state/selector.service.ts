import { Injectable } from '@angular/core';
import { Selector } from '@ngxs/store';
import { StateModel } from '../models/state.model';
import { BaseState } from './main.state';

@Injectable({
  providedIn: 'root'
})
export class SelectorService {

  constructor() { }

  @Selector([BaseState])
  // tslint:disable-next-line:typedef
  static getMessages(state: StateModel) {
    return state.messages.messagesData;
  }

  @Selector([BaseState])
  // tslint:disable-next-line:typedef
  static getBuddyMessages(state: StateModel) {
    return state.messages.buddyMessagesData;
  }

  @Selector([BaseState])
  // tslint:disable-next-line:typedef
  static getCurrentUser(state: StateModel) {
    return state.userDetails.email;
  }

  @Selector([BaseState])
  // tslint:disable-next-line:typedef
  static getUserDetails(state: StateModel) {
    return state.userDetails.profile;
  }

  @Selector([BaseState])
  // tslint:disable-next-line:typedef
  static getAllMessages(state: StateModel) {
    return state.messages.allMessagesData;
  }

  @Selector([BaseState])
  // tslint:disable-next-line:typedef
  static getAllBuddyMessages(state: StateModel) {
    return state.messages.allBuddyMessagesData;
  }

  @Selector([BaseState])
  // tslint:disable-next-line:typedef
  static getScreenIndex(state: StateModel) {
    return state.config.screenIndex;
  }

  @Selector([BaseState])
  // tslint:disable-next-line:typedef
  static getMessageLoading(state: StateModel) {
    return state.messages.isMessageLoading;
  }
}
