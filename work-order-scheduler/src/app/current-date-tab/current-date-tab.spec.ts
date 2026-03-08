import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentDateTab } from './current-date-tab';

describe('CurrentDateTab', () => {
  let component: CurrentDateTab;
  let fixture: ComponentFixture<CurrentDateTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentDateTab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentDateTab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
