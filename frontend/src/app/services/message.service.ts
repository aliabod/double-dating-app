import { Injectable } from '@angular/core';
import {AuthenticationService} from "./authentication.service";
import {map} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  isAuthenticated: boolean;
  currentUser: any;

  constructor(private authenticationService: AuthenticationService, private http: HttpClient) {
    this.currentUser = this.authenticationService.currentUserValue;

    if (this.currentUser !== null) {
      this.isAuthenticated = true;
    }
  }

  send(message): any {
    const url = 'http://localhost:3000/api/message/send';
    if (this.isAuthenticated) {
      return this.http.post<any>(url, {message: message})
        .pipe(
          map(response => {
            const data = response;
            if (data.status === 'OK') {
              return true;
            } else {
              return false;
            }
          })
        );
    } else {
      return false;
    }
  }

  sendBuddy(message): any {
    const url = 'http://localhost:3000/api/buddy/message/send';
    if (this.isAuthenticated) {
      return this.http.post<any>(url, {message: message})
        .pipe(
          map(response => {
            const data = response;
            if (data.status === 'OK') {
              return true;
            } else {
              return false;
            }
          })
        );
    } else {
      return false;
    }
  }

  fetch(targetUser): any {
    const url = 'http://localhost:3000/api/message/get/' + this.currentUser.user + '/' + targetUser;
    if (this.isAuthenticated) {
      return this.http.get<any>(url)
        .pipe(
          map(response => {
            const data = response;
            if (data.status === 'OK') {
              return data.msg;
            } else {
              return false;
            }
          })
        );
    } else {
      return false;
    }
  }

  fetchBuddy(sourceBuddy, targetBuddy): any {
    const url = 'http://localhost:3000/api/message/buddy/get/' + sourceBuddy + '/' + targetBuddy;
    if (this.isAuthenticated) {
      return this.http.get<any>(url)
        .pipe(
          map(response => {
            const data = response;
            if (data.status === 'OK') {
              return data.msg;
            } else {
              return false;
            }
          })
        );
    } else {
      return false;
    }
  }

  fetchAll(user): any  {
    const url = 'http://localhost:3000/api/message/get/' + user;
    return this.http.get<any>(url)
      .pipe(
        map(response => {
          const data = response;
          if (data.status === 'OK') {
            return data.msg;
          } else {
            return false;
          }
        })
      );
  }
}
