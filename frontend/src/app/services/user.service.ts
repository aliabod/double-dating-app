import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  fetch(targetUser): any {
    const url = 'http://localhost:3000/api/user/get/' + targetUser;
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

  fetchDetails(targetUser): any {
    const url = 'http://localhost:3000/api/user/details/get/' + targetUser;
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

  fetchBuddyDetails(targetBuddy): any {
    const url = 'http://localhost:3000/api/buddies/get/details/' + targetBuddy;
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

  setBuddy(formData): Observable<any> {
    const url = 'http://localhost:3000/api/buddy/set';
    return this.http.post(url, {userDetails: formData});
  }

  getBuddyRequest(sourceUser): any {
    const url = 'http://localhost:3000/api/buddy/get/' + sourceUser;
    return this.http.get<any>(url)
      .pipe(
        map(response => {
          return response;
        })
      );
  }

  getBuddyDetails(buddyUpID): Observable<any> {
    const url = 'http://localhost:3000/api/buddy/get/details/' + buddyUpID;
    return this.http.get<any>(url)
      .pipe(
        map(response => {
          const data = response;
          console.log(data);
          if (data.status === 'OK') {
            return data.msg;
          } else {
            return false;
          }
        })
      );
  }

  getBuddyStatus(sourceUser): any {
    const url = 'http://localhost:3000/api/buddy/get/status/' + sourceUser.user;
    return this.http.get<any>(url)
      .pipe(
        map(data => {
          if (data.status === 'OK') {
            return data.msg;
          } else {
            return false;
          }
        })
      );
  }

  cancelBuddyUp(buddyUpID): Observable<any> {
    const url = 'http://localhost:3000/api/buddy/cancel';
    return this.http.post(url, {id: buddyUpID});
  }

  cancelBuddyUpRequest(buddyUpID): Observable<any> {
    const url = 'http://localhost:3000/api/buddy/cancel/request';
    return this.http.post(url, {id: buddyUpID});
  }

  acceptBuddyUp(data): Observable<any> {
    const url = 'http://localhost:3000/api/buddy/accept';
    return this.http.post(url, {details: data});
  }

  updateDetails(formData, profilePic): Observable<any> {
    const url = 'http://localhost:3000/api/user/details';
    return this.http.post(url, {userDetails: formData, profilePic: profilePic});
  }

  disableAccount(email): Observable<any> {
    const url = 'http://localhost:3000/api/user/disable';
    return this.http.post(url, {userDetails: email});
  }

  enableAccount(email): Observable<any> {
    const url = 'http://localhost:3000/api/user/enable';
    return this.http.post(url, {userDetails: email});
  }

  blockUser(sourceUser, targetUser): Observable<any> {
    const url = 'http://localhost:3000/api/user/block';
    return this.http.post(url, {sourceUser: sourceUser, targetUser: targetUser});
  }

  unblockUser(sourceUser, targetUser): Observable<any> {
    const url = 'http://localhost:3000/api/user/unblock';
    return this.http.post(url, {sourceUser: sourceUser, targetUser: targetUser});
  }

  getBlocked(sourceUser): any {
    const url = 'http://localhost:3000/api/user/blocked/' + sourceUser;
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

  fetchUsers(minAge, maxAge, distance, user): Observable<any> {
    const url = 'http://localhost:3000/api/user/get/' + minAge + '/' + maxAge + '/' + distance + '/' + user ;
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

  fetchBuddies(minAge, maxAge, distance, buddyId): Observable<any> {
    const url = 'http://localhost:3000/api/buddies/get/' + minAge + '/' + maxAge + '/' + distance + '/' + buddyId ;
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

  getRecommendation(sourceUser): Observable<any> {
    const url = 'http://localhost:3000/api/user/recommendations/' + sourceUser;
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
