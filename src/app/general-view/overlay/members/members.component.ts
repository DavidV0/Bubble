import { Component, inject } from '@angular/core';
import { OverlaycontrolService } from '../../../services/overlaycontrol.service';
import { Subscription } from 'rxjs';
import { ChannelService } from '../../../services/channel.service';
import { Channel } from '../../../shared/models/channel.class';
import { UserlistitemComponent } from '../../../shared/components/userlistitem/userlistitem.component';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [UserlistitemComponent],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss',
})
export class MembersComponent {
  overlayCtrlService = inject(OverlaycontrolService);
  channelService = inject(ChannelService);

  unsubActiveChannel: Subscription;
  activeChannel: Channel = new Channel();

  constructor() {
    this.unsubActiveChannel = this.channelService.activeChannel$.subscribe(
      (channel) => {
        this.activeChannel = channel;
      }
    );
  }
}
