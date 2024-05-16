import { Component, inject } from '@angular/core';
import { OverlaycontrolService } from '../../../services/overlaycontrol.service';

@Component({
  selector: 'app-workspace-menu',
  standalone: true,
  imports: [],
  templateUrl: './workspace-menu.component.html',
  styleUrl: './workspace-menu.component.scss',
})
export class WorkspaceMenuComponent {
  overlayControlService = inject(OverlaycontrolService);
}
