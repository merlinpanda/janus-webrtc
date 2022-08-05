import { JANUS_EVENT, JANUS_PLUGINS, RTCCmds, UserInfo, VideoRoomRole } from "../defines";
import VideoStream from "./video-stream";
import { Ref } from "react";

type VideoRoomType = {
  user: UserInfo;
  room: number;
  role: VideoRoomRole;
}

class VideoRoom extends VideoStream {

  private user: UserInfo;

  public room: number;

  private role: VideoRoomRole;

  constructor (props: VideoRoomType) {
    super();

    this.user = props.user;
    this.room = props.room;
    this.role = props.role;
  }

  protected janusInited = () => {
    console.log('this is video room listener : janus inited')
    this.createClient()
  }

  protected janusCreated = () => {
    this.attach(JANUS_PLUGINS.VideoRoom);
  }

  protected janusAttachSuccess = () => {
    this.joinRoom();
  }

  protected janusOnLocalTrack = (data: any) => {
    let track = data.track;
    let on = data.on;
    console.log("Local track " + (on ? "added" : "removed") + ":", track);
    var trackId = track.id.replace(/[{}]/g, "");
    var stream = this.localTracks[trackId];
    if (! on) {
      if(stream) {
        try {
          var tracks = stream.getTracks();
          for(var i in tracks) {
            var mst = tracks[i];
            if(mst !== null && mst !== undefined)
              mst.stop();
          }
        } catch(e) {}
      }

      if(track.kind === "video") {
        this.localVideos --;
        if(this.localVideos === 0) {

        }
      }

      delete this.localTracks[trackId];
      return;
    }

    if(stream) {
      // We've been here already
      return;
    }

    if (track.kind !== 'audio') {
      this.localVideos ++;
      stream = new MediaStream([track]);
      this.localTracks[trackId] = stream;
      this.rtc.emitter.emit(JANUS_EVENT.MINE_VIDEO_STREAM_CHANGED, stream);
    }
  }

  public joinRoom = () => {
    this.handle?.send({
      message: {
        request: RTCCmds.JOIN,
        room: this.room,
        ptype: this.role,
        display: this.user.name ?  this.user.name : '访客'
      }
    })
  }
}

export default VideoRoom;
