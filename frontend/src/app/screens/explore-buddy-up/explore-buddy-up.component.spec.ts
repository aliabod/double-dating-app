import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreBuddyUpComponent } from './explore-buddy-up.component';

describe('ExploreBuddyUpComponent', () => {
  let component: ExploreBuddyUpComponent;
  let fixture: ComponentFixture<ExploreBuddyUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExploreBuddyUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreBuddyUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
