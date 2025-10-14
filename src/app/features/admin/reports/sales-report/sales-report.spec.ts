import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesReportComponent } from './sales-report';

describe('SalesReport', () => {
  let component: SalesReportComponent;
  let fixture: ComponentFixture<SalesReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
