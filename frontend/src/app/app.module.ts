import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeScreenComponent } from './screens/home-screen/home-screen.component';
import { PageNotFoundScreenComponent } from './screens/page-not-found-screen/page-not-found-screen.component';
import {AppRoutingModule} from './app-routing.module';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import {MatButtonModule} from '@angular/material/button';
import { LoginDialogComponent } from './dialogs/login-dialog/login-dialog.component';
import {SignupDialogComponent} from './dialogs/signup-dialog/signup-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { MessagesComponent } from './components/messages/messages.component';
import {MatCardModule} from '@angular/material/card';
import {CommonModule} from '@angular/common';
import { MessageDialogComponent } from './dialogs/message-dialog/message-dialog.component';
import {NgxsModule} from '@ngxs/store';
import { BaseState } from './state/main.state';
import {NgxsReduxDevtoolsPluginModule} from '@ngxs/devtools-plugin';
import { ProfileComponent } from './screens/profile/profile.component';
import {MatNativeDateModule, MatOptionModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {MatDatepickerModule} from "@angular/material/datepicker";
import { DisableConfirmationComponent } from './dialogs/disable-confirmation/disable-confirmation.component';
import {MatFileUploadModule} from "mat-file-upload";
import { ExploreComponent } from './screens/explore/explore.component';
import {MatSliderModule} from "@angular/material/slider";
import {NgxSliderModule} from "@angular-slider/ngx-slider";
import {MatIconModule} from "@angular/material/icon";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import { BlockedUsersComponent } from './dialogs/blocked-users/blocked-users.component';
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatChipsModule} from "@angular/material/chips";
import { BuddyUpDialogComponent } from './dialogs/buddy-up-dialog/buddy-up-dialog.component';
import { ExploreBuddyUpComponent } from './screens/explore-buddy-up/explore-buddy-up.component';
import { BuddyMessageDialogComponent } from './dialogs/buddy-message-dialog/buddy-message-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeScreenComponent,
    PageNotFoundScreenComponent,
    NavbarComponent,
    FooterComponent,
    LoginDialogComponent,
    SignupDialogComponent,
    MessagesComponent,
    MessageDialogComponent,
    ProfileComponent,
    DisableConfirmationComponent,
    ExploreComponent,
    BlockedUsersComponent,
    BuddyUpDialogComponent,
    ExploreBuddyUpComponent,
    BuddyMessageDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatCardModule,
    CommonModule,
    NgxsModule.forRoot([]),
    NgxsModule.forFeature([BaseState]),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    MatOptionModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFileUploadModule,
    MatSliderModule,
    NgxSliderModule,
    MatIconModule,
    InfiniteScrollModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
