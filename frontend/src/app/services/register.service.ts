import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  constructor(private client: HttpClient) {

  }

  registerUser(formData, profilePic): Observable<any> {
    const url = 'http://localhost:3000/api/user/register';
    return this.client.post(url, {userData: formData, profilePic: profilePic});
  }
}
