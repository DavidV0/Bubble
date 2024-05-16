export type OverlayType =
  | 'hide'
  | 'dropDownUserMenu'
  | 'registeredUserProfile'
  | 'editProfile'
  | 'userProfile'
  | 'createChannel'
  | 'editChannel'
  | 'members'
  | 'add-members';

export type MessageComponent = 'channel' | 'directMessage' | 'newMessage';


export interface ThreadIndex {
  amount: number;
  time: number;
}