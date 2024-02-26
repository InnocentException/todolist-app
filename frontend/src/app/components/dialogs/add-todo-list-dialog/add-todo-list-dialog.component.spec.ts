import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTodoListDialogComponent } from './add-todo-list-dialog.component';

describe('AddTodoListDialogComponent', () => {
  let component: AddTodoListDialogComponent;
  let fixture: ComponentFixture<AddTodoListDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTodoListDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddTodoListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
