import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, Observable} from "rxjs";
import {map} from "rxjs/operators";
import {Router} from "@angular/router";
import {Store} from "@ngxs/store";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<any>
  public currentUser: Observable<any>;

  constructor(private http: HttpClient, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  public currentUserDetails(): Observable<any> {
    return new Observable<any>((observer) => {
      return this.currentUserSubject.value;
    });
  }

  login(email: string, password: string): any {
    const url = 'http://localhost:3000/api/user/login';
    return this.http.post<any>(url, {email, password})
      .pipe(
        map(response => {
          const data = response;
          if (data.status === 'OK') {
            const user = data.msg;
            localStorage.setItem('currentUser', JSON.stringify({user: user}));
            this.currentUserSubject.next(user);
            return user;
          } else {
            return null;
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
