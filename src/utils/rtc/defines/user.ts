export type UserInfo = {
  id: number;
  name?: string;
  token?: string;
}

export enum VideoRoomRole {
  Publisher = 'publisher',
  Subscriber = 'subscriber',
}