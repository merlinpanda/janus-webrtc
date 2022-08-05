import Janus, { JanusJS } from '../../janus/janus';

type VideoType = {
  handle: JanusJS.PluginHandle;
}

class Video {

  public videoOpen: boolean = true;

  public audioOpen: boolean = true;

  public handle: JanusJS.PluginHandle;

  public videoInputs: MediaDeviceInfo[] = [];

  public audioInputs: MediaDeviceInfo[] = [];

  private audioDeviceId: string | null = null;

  private videoDeviceId: string | null = null;

  constructor (props: VideoType) {
    this.handle = props.handle;
  }

  public capture = (audioDeviceId: string, videoDeviceId: string) => {
    var body = {
      audio: this.audioOpen,
      video: this.videoOpen
    };

    Janus.debug("Sending message:", body);
    // this.handle.send({ message: body });
    this.handle.createOffer({
      media: {
        audio: {
          deviceId: audioDeviceId
        },
        video: {
          deviceId: videoDeviceId
        },
        data: true
      },
      success: (jsep: any) => {
        this.audioDeviceId = audioDeviceId;
        this.videoDeviceId = videoDeviceId;

        this.handle.send({
          message: body,
          jsep
        })
      },
      error: () => {}
    })
  }

}

export default Video;