import adapter from "webrtc-adapter";
import Janus, { JanusJS } from "../../janus/janus";
import { AudioCodec, JANUS_EVENT, JANUS_HOST, JANUS_PLUGINS, VideoCodec } from "../defines";
import RTC from "../RTC";
import  { EventType, WildcardHandler } from "mitt";


type JanusEvent = {
  name: any;
  listener: WildcardHandler<Record<EventType, unknown>>
}


abstract class VideoStream {

  public rtc: RTC = RTC.getInstance();

  public isDebug: boolean | JanusJS.DebugLevel[] | 'all' = 'all';

  public janus: Janus | undefined;

  public handle: JanusJS.PluginHandle | undefined;

  private opaqueId: string = '';

  public acodec: AudioCodec | undefined;

  public vcodec: VideoCodec | undefined;

  public localTracks: object = {};

  public localVideos: number = 0;

  /**
   * 视频输入设备列表
   */
  public videoInputDevices: InputDeviceInfo[] = [];

   /**
    * 音频输入设备列表
    */
  public audioInputDevices: InputDeviceInfo[] = [];

   /**
    * 音频输出设备列表
    */
  public audioOutputDevices: MediaDeviceInfo[] = [];

   /**
    * 当前视频输入设备
    */
  private currentVideoInputDevice: InputDeviceInfo | undefined;

   /**
    * 当前音频输入设备
    */
  private currentAudioInputDevice: InputDeviceInfo | undefined;

   /**
    * 当前音频输出设备
    */
  private currentAudioOutputDevice: MediaDeviceInfo | undefined;


  constructor () {
    // 获取音视频输入、输出设备列表
    this.getAllDevice();
  }

   /**
   * 绑定事件处理器
   */
  private eventsBind = () => {
    let events: JanusEvent[] =  [
      {
        name: JANUS_EVENT.JANUS_INITED,
        listener: this.janusInited
      },
      {
        name: JANUS_EVENT.JANUS_CREATE_SUCCESS,
        listener: this.janusCreated
      },
      {
        name: JANUS_EVENT.JANUS_CREATE_FAILD,
        listener: this.janusCreateFaild
      },
      {
        name: JANUS_EVENT.JANUS_DESTROYED,
        listener: this.janusDestroyed
      },
      //JANUS_ATTACH_SUCCESS
      {
        name: JANUS_EVENT.JANUS_ATTACH_SUCCESS,
        listener: this.janusAttachSuccess
      },
      {
        name: JANUS_EVENT.JANUS_ONLOCAL_TRACK,
        listener: this.janusOnLocalTrack
      }
    ];

    events.forEach((event: JanusEvent) => {
      this.rtc.emitter.on(event.name, event.listener)
    })
  }

  public init = async () => {
    // 事件绑定
    this.eventsBind();

    // Janus init
    Janus.init({
      debug: this.isDebug,
      dependencies: Janus.useDefaultDependencies({ adapter }),
      callback: () => {

        // 触发janus初始化成功事件
        this.rtc.emitter.emit(JANUS_EVENT.JANUS_INITED)
      }
    });

  }

  public createClient = () => {
    this.janus = new Janus({
      server: JANUS_HOST,
      success: () => {
        this.rtc.emitter.emit(JANUS_EVENT.JANUS_CREATE_SUCCESS);
      },
      error: (e) => {
        this.rtc.emitter.emit(JANUS_EVENT.JANUS_CREATE_FAILD, e);
      },
      destroyed: () => {
        this.rtc.emitter.emit(JANUS_EVENT.JANUS_DESTROYED);
      }
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

  public attach = (plugin: JANUS_PLUGINS, opaqueId?: string) => {
    this.janus?.attach({
      plugin,
      opaqueId: opaqueId ? opaqueId : this.getOpaqueId(),
      success: (handle: JanusJS.PluginHandle) => {
        this.handle = handle;
        console.log('this is video stream handle', handle);
        this.rtc.emitter.emit(JANUS_EVENT.JANUS_ATTACH_SUCCESS);
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
        this.rtc.emitter.emit(JANUS_EVENT.JANUS_ONLOCAL_TRACK, {track, on});
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
  }

  public capture = (audioDeviceId: string, videoDeviceId: string) => {
    var body = {
      video: true,
      audio: true,
    }

    if (this.acodec) {
      body['audiocodec'] = this.acodec;
    }
    if (this.vcodec) {
      body['videocodec'] = this.vcodec;
    }

    this.handle?.send({ message: body })
  }

  /**
   * 房间唯一编号
   *
   * @returns string
   */
  public getOpaqueId = (): string => {
    if (this.opaqueId) {
      this.opaqueId = 'videoroom_' + Janus.randomString(16)
    }

    return this.opaqueId;
  }

  protected janusInited = () => {
    console.log('janus inited')
  };

  protected janusCreateFaild = (e: any) => {
    console.log('janus create faild', e)
  }

  protected janusDestroyed = () => {
    console.log('janus destroyed')
  }

  protected janusCreated = () => {
    console.log('janus created')
  };

  protected janusAttachSuccess = () => {
    console.log('get handle', this.handle)
  }

  protected janusOnLocalTrack = (data: any) => {
    console.log('on local track', data)
  }

  /**
   * 协商设备信息
   */

  /**
   * 获取音视频输入、输出设备列表
  **/
  private getAllDevice = () => {
    navigator.mediaDevices.enumerateDevices().then((devices: MediaDeviceInfo[]) => {
      devices.map((device) => {
        if (device.kind === 'audioinput') {
          this.audioInputDevices.push(device);
        }

        if (device.kind === 'audiooutput') {
          this.audioOutputDevices.push(device);
        }

        if (device.kind === 'videoinput') {
          this.videoInputDevices.push(device);
        }
      })

      if (this.audioInputDevices.length > 0) {
        this.currentAudioInputDevice = this.audioInputDevices[0]
      }

      if (this.videoInputDevices.length > 0) {
        this.currentVideoInputDevice = this.videoInputDevices[0];
      }

      if (this.audioOutputDevices.length > 0) {
        this.currentAudioOutputDevice = this.audioOutputDevices[0]
      }
    })
  }

  // 浏览器检测

  // 初始化Janus

  // 实例化Janus

  // 处理句柄事件绑定

  // 协商   --> 更换设备 --> 重新协商

  // 发送sdp文件
}

export default VideoStream;
