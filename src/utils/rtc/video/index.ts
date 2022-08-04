import Janus, { JanusJS } from '../../janus/janus';

type VideoType = {
  handle: JanusJS.PluginHandle;
}

class Video {

  public videoOpen: boolean = true;

  public audioOpen: boolean = true;

  public handle: JanusJS.PluginHandle;

  private audioDeviceId: string;

  private videoDeviceId: string;

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
        replaceAudio: this.audioDeviceId === audioDeviceId,
        video: {
          deviceId: videoDeviceId
        },
        replaceVideo: this.videoDeviceId === videoDeviceId,
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