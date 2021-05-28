import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class InteractionService {

  constructor(private http: HttpClient) { }

  like(source, target): any {
    const url = 'http://localhost:3000/api/user/interaction';
    return this.http.post(url, {sourceUser: source, targetUser: target, type: 1});
  }

  dislike(source, target): any {
    const url = 'http://localhost:3000/api/user/interaction';
    return this.http.post(url, {sourceUser: source, targetUser: target, type: 0});
  }

  superlike(source, target): any {
    const url = 'http://localhost:3000/api/user/interaction';
    return this.http.post(url, {sourceUser: source, targetUser: target, type: 2});
  }

  getMatches(user): any {
    const url = 'http://localhost:3000/api/match/get/' + user;
    return this.http.get<any>(url);
  }

  likeBuddy(source, target): any {
    const url = 'http://localhost:3000/api/buddy/interaction';
    return this.http.post(url, {sourceBuddy: source, targetBuddy: target, type: 1});
  }

  dislikeBuddy(source, target): any {
    const url = 'http://localhost:3000/api/buddy/interaction';
    return this.http.post(url, {sourceBuddy: source, targetBuddy: target, type: 0});
  }

  superlikeBuddy(source, target): any {
    const url = 'http://localhost:3000/api/buddy/interaction';
    return this.http.post(url, {sourceBuddy: source, targetUser: target, type: 2});
  }

  getMatchesBuddy(targetBuddy): any {
    const url = 'http://localhost:3000/api/buddymatch/get/' + targetBuddy;
    return this.http.get<any>(url);
  }
}
