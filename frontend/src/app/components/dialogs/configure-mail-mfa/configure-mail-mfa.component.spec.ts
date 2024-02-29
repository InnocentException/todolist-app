import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureMailMfaComponent } from './configure-mail-mfa.component';

describe('ConfigureMailMfaComponent', () => {
  let component: ConfigureMailMfaComponent;
  let fixture: ComponentFixture<ConfigureMailMfaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigureMailMfaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigureMailMfaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
