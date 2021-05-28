import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisableConfirmationComponent } from './disable-confirmation.component';

describe('DisableConfirmationComponent', () => {
  let component: DisableConfirmationComponent;
  let fixture: ComponentFixture<DisableConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisableConfirmationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisableConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
