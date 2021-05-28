import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuddyMessageDialogComponent } from './buddy-message-dialog.component';

describe('BuddyMessageDialogComponent', () => {
  let component: BuddyMessageDialogComponent;
  let fixture: ComponentFixture<BuddyMessageDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuddyMessageDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuddyMessageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
