import RTC from "..";
import Janus, { JanusJS } from "../../janus/janus";
import { RTCCmds, RTCType } from "../defines";
import { UserInfo, VideoRoomRole } from "../defines/user";
import HandleMessage from "../handleMessage";
import mitt from "mitt";
import Client from "../client";

export type joinProps = {
  room: number;
  user: UserInfo;
  ptype: VideoRoomRole;
}

class VideoRoom {
  public handle: JanusJS.PluginHandle | undefined;

  private janus: Janus | undefined;

  public emitter = mitt();

  private room: Number | undefined;

  public videoRoomId: string | undefined;

  public videoInputs: MediaDeviceInfo[] = [];

  public audioInputs: MediaDeviceInfo[] = [];

  public currentVideo: MediaDeviceInfo | null = null;

  public currentAudio: MediaDeviceInfo | null = null;

  constructor () {
    this.videoRoomId = 'videoroom-' + Janus.randomString(10)

    // 初始化音频信息
    Client.getAudioInputDevices((audios: MediaDeviceInfo[]) => {
      this.audioInputs = audios;
      this.currentAudio = audios.length > 0 ? audios[0] : null;
    })

    // 初始化视频信息
    Client.getVideoInputDevices((videos: MediaDeviceInfo[]) => {
      this.videoInputs = videos;
      this.currentVideo = videos.length > 0 ? videos[0] : null;
    })
  }

  public createOffer = (useAudio: boolean) => {
    this.handle?.createOffer({
      media: { audioRecv: false, videoRecv: false, audioSend: useAudio, videoSend: true },
      success: (jsep: any) => {
        Janus.log("Got publisher SDP!", jsep);
        var publish = { request: "configure", audio: useAudio, video: true };
        // if(acodec)
				// 	publish["audiocodec"] = acodec;
				// if(vcodec)
				// 	publish["videocodec"] = vcodec;
				this.handle?.send({ message: publish, jsep: jsep });
      },
      error: (error) => {
				Janus.error("WebRTC error:", error);
				if(useAudio) {
					 this.createOffer(false);
				} else {
          Janus.log("WebRTC error... " + error.message)
				}
			}
    })
  }

  // 当设备不可用/下线时
  // |
  // v

  // 当主动切换设备时
  // |
  // v

  // 重新协商设备信息

  public init = async (props: joinProps) => {
    var that = this;
    RTC.init().then((janus: Janus) => {
      that.janus = janus;
      that.janus?.attach({
        plugin: RTCType.VideoRoom,
        opaqueId: that.videoRoomId,
        success: (handle) => {
          that.handle = handle;
          console.log('get handle', that.handle)

          // 加入会议室
          this.join(props);
        },
        error: (e) => {
          console.log('error ', e);
        },
        onmessage: (msg, jsep?) => {
          Janus.log(" ::: Got a message (publisher) :::", msg);
          var event = msg["videoroom"];
          Janus.log("Event: " + event);
          if (event) {
            if (event === 'joined') {
              let myid = msg["id"];
              let mypvtid = msg["private_id"];
              Janus.log("Successfully joined room " + msg["room"] + " with ID " + myid);

              this.createOffer(true);
            }
          }

          if (jsep) {
            this.handle?.handleRemoteJsep({ jsep: jsep });
          }
        },
        onlocaltrack: (track, on) => {
          Janus.log("Local track " + (on ? "added" : "removed") + ":", track);
          this.emitter.emit('videoroom-local-track', {track, on})
        },
        onremotetrack: (track, mid, on) => {

        },
        oncleanup: () => {
          // clean up
        },
        consentDialog: (on) => {
          Janus.debug("[consentDialog] Consent dialog should be " + (on ? "on" : "off") + " now");
        },
        iceState: (state) => {
          Janus.log("[iceState] ICE state changed to " + state);
        },
        mediaState: (medium, on, mid) => {
          Janus.log("[mediaState] Janus " + (on ? "started" : "stopped") + " receiving our " + medium + " (mid=" + mid + ")");
        },
        webrtcState: (on) => {
          Janus.log("[webrtcState] Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
        },
        slowLink(uplink, lost, mid) {
          Janus.log("uplink:" + uplink + "; lost: " + lost + '; mid: ' + mid);
        },
        ondataopen: () => {
          Janus.log("ondataopen");
        },
        ondata: () => {
          Janus.log('ondata');
        },
      })
    }).catch(e => {
     console.log("[ videoroom init error ]", e)
    })
  }

  public join = async (props: joinProps) => {
    console.log('join handle', this.handle)
    await HandleMessage.joinRoom({
      handle: this.handle,
      message: {
        request: RTCCmds.JOIN,
        room: props.room,
        ptype: props.ptype,
        display: props.user.name ?  props.user.name : '访客'
      }
    }).then(() => {
      Janus.log("Join Video Room Success");
    }).catch((e) => {
      Janus.log("Join Video Room Faild", e);
    })
  }
}

export default VideoRoom;
