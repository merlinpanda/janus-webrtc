export const JANUS_HOST =  'http://localhost:8088/janus';

export enum JANUS_EVENT {
  JANUS_INITED = 'janus.inited',
  JANUS_CREATE_SUCCESS = 'janus.create.success',
  JANUS_CREATE_FAILD = 'janus.create.faild',
  JANUS_DESTROYED = 'janus.destroyed',

  JANUS_ATTACH_SUCCESS = 'janus.attach.success',
  JANUS_ONLOCAL_TRACK = 'janus.onlocaltrack',

  MINE_VIDEO_STREAM_CHANGED = 'mine.video.stream.changed'
}

export enum JANUS_PLUGINS {
  VideoRoom = 'janus.plugin.videoroom',
  VideoCall = 'janus.plugin.videocall',
  LiveRoom = 'janus.plugin.streaming',
  TextRoom = 'janus.plugin.textroom',
  RecordPlay = 'janus.plugin.recordplay'
}

export enum RTCCmds {
  JOIN = 'join'
}

export type AudioCodec = 'opus' | 'g722' | 'pcmu' | 'pcma' | 'isac32' | 'isac16';

export type VideoCodec = 'vp8' | 'vp9' | 'h264' | 'av1' | 'h265';

export type UserInfo = {
  userId: number;
  name?: string;
  token?: string
}


export enum VideoRoomRole {
  Publisher = 'publisher',
  Subscriber = 'subscriber',
}