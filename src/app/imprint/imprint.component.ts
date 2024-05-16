import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [RouterLinkActive],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss',
})
export class ImprintComponent {
  constructor(private router: Router, private route: ActivatedRoute) {}

  goBack() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
