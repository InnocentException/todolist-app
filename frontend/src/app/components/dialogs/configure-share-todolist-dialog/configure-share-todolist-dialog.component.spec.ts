import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureShareTodolistDialogComponent } from './configure-share-todolist-dialog.component';

describe('ConfigureShareTodolistDialogComponent', () => {
  let component: ConfigureShareTodolistDialogComponent;
  let fixture: ComponentFixture<ConfigureShareTodolistDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigureShareTodolistDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigureShareTodolistDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
