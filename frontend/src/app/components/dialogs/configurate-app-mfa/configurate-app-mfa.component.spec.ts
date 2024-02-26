import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurateAppMfaComponent } from './configurate-app-mfa.component';

describe('ConfigurateAppMfaComponent', () => {
  let component: ConfigurateAppMfaComponent;
  let fixture: ComponentFixture<ConfigurateAppMfaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigurateAppMfaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigurateAppMfaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
