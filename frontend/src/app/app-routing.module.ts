import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeScreenComponent} from './screens/home-screen/home-screen.component';
import {PageNotFoundScreenComponent} from './screens/page-not-found-screen/page-not-found-screen.component';
import {ProfileComponent} from './screens/profile/profile.component';
import {ExploreComponent} from './screens/explore/explore.component';
import {MessagesComponent} from './components/messages/messages.component';
import {ExploreBuddyUpComponent} from './screens/explore-buddy-up/explore-buddy-up.component'; // CLI imports router

const routes: Routes = [
  { path: 'home', component: HomeScreenComponent },
  { path: 'profile', component: ProfileComponent},
  { path: 'explore', component: ExploreComponent},
  { path: 'exploreBuddies', component: ExploreBuddyUpComponent},
  { path: 'messages', component: MessagesComponent},
  { path: '',   redirectTo: '/home', pathMatch: 'full' }, // redirect to `first-component`
  { path: '**', component: PageNotFoundScreenComponent },  // Wildcard route for a 404 page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
