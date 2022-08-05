import VideoRoom from "../utils/vc/video/video-room";
import { Button, Select } from 'tdesign-react';
import { JANUS_EVENT, VideoRoomRole } from "../utils/vc/defines";
import { useRef, useState } from "react";
import RTC from "../utils/vc/RTC";


function Test () {
  const mineVideo = useRef<HTMLVideoElement>(null);
  const [ videoDevices, setVideoDevices ] = useState<MediaDeviceInfo[]>([])

  var rtc = RTC.getInstance();

  rtc.emitter.on(JANUS_EVENT.MINE_VIDEO_STREAM_CHANGED, (stream) => {
    mineVideo.current ? mineVideo.current.srcObject = stream : null
  })


  // rtc.videoDevices().then((devices) => {
  //   setVideoDevices(devices);
  //   console.log(devices)
  // });

  var vr = new VideoRoom({
    user: {
      userId: 1,
      name: '张三',
      token: 'xxxxx'
    },
    room: 1234,
    role: VideoRoomRole.Publisher
  });

  const init = () => {
    vr.init();
  }

  return (
    <div>
      <div className="p-4 bg-white flex flex-row justify-center items-center gap-4">
        <Button onClick={init}>初始化</Button>
        <Select
          onChange={(e) => {
            console.log(e)
          }}
          style={{ width: '40%' }}
          clearable
          options={ videoDevices?.map((device) => {
            return {
              label: device.label,
              value: device.deviceId
            }
          })}
        ></Select>
      </div>

      <div className="p-4 max-w-6xl mx-auto">
        <video className="w-full" playsInline autoPlay ref={mineVideo}></video>
      </div>
    </div>
  )
}

export default Test;
