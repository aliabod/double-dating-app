import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingupDialogComponent } from './signup-dialog.component';

describe('SingupDialogComponent', () => {
  let component: SingupDialogComponent;
  let fixture: ComponentFixture<SingupDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingupDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
