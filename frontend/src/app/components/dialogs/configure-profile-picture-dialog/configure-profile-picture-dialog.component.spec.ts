import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureProfilePictureDialogComponent } from './configure-profile-picture-dialog.component';

describe('ConfigureProfilePictureDialogComponent', () => {
  let component: ConfigureProfilePictureDialogComponent;
  let fixture: ComponentFixture<ConfigureProfilePictureDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigureProfilePictureDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigureProfilePictureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
