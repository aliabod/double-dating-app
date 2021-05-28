import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuddyUpDialogComponent } from './buddy-up-dialog.component';

describe('BuddyUpDialogComponent', () => {
  let component: BuddyUpDialogComponent;
  let fixture: ComponentFixture<BuddyUpDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuddyUpDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuddyUpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
