import RTC from "../utils/rtc";
import { Button, Dropdown } from 'tdesign-react'
import VideoRoom from "../utils/rtc/videoroom";
import { VideoRoomRole } from "../utils/rtc/defines/user";
import Janus, { JanusJS } from "../utils/janus/janus";
import { useRef, useState } from "react";
import Client from "../utils/rtc/client";
import { PhotoIcon, ServiceIcon, DesktopIcon } from 'tdesign-icons-react';
import VideoStream from "../utils/vc/video/video-stream";
import VideoCall from "../utils/vc/video/video-call";


function JanusTest () {
  const Mine = useRef<HTMLVideoElement>(null);
  const [ videoInputs, setVideoInputs ] = useState<MediaDeviceInfo[]>([]);
  const [ audioInputs, setAudioInputs ] = useState<MediaDeviceInfo[]>([]);
  const [ inited, setInited ] = useState<boolean>(false)
  const [ handle, setHandle ] = useState<JanusJS.PluginHandle>();

  var localTracks = {}, localVideos = 0;

  var videoRoom = new VideoRoom();

  const localTrackHandler = (param: any) => {
    let track = param?.track;
    let on = param?.on;

    Janus.log("Local track " + (on ? "added" : "removed") + ":", track);
    var trackId = track.id.replace(/[{}]/g, "");
    var stream = localTracks[trackId];

    if (! on) {
      // 轨道移除
      if (stream) {
        try{
          var tracks = stream.getTracks();
          for (var i in tracks){
            var mst = tracks[i];
            if (mst !== null && mst !== undefined) {
              mst.stop();
            }
          }
        } catch(e) {}
      }

      if (track.kind === 'video') {
        localVideos--;
      }

      delete localTracks[trackId];
      return;
    }

    if (stream) {
      return;
    }

    if (track.kind !== 'audio') {
      localVideos ++;
      stream = new MediaStream([track]);
      localTracks[trackId] = stream;
      Janus.log("Created local stream:", stream);
      Janus.log(stream.getTracks());
      Janus.log(stream.getVideoTracks());
      Mine.current ?  Mine.current.srcObject = stream : null;
    }
  }

  videoRoom.emitter.on('videoroom-local-track', localTrackHandler);

  const init = async () => {
    let vs = new VideoStream();
    setTimeout(() => {
      console.log('videoInputDevices', vs.videoInputDevices);
      console.log('audioInputDevices', vs.audioInputDevices);
      console.log('audioOutputDevices', vs.audioOutputDevices);
    }, 1000)
    // setAudioInputs(videoRoom.audioInputs);
    // setVideoInputs(videoRoom.videoInputs);

    // setInited(true)

    // await videoRoom.init({
    //   room: 1234,
    //   user: {
    //     id: 1,
    //     name: '张三',
    //   },
    //   ptype: VideoRoomRole.Publisher
    // })
  }

  const videoInputOptions = () => {
    return videoInputs.map((device) => {
      return {
        content: device.label,
        value: device.deviceId
      }
    })
  }

  const handleVideoInputChange = (e: any) => {

  }

  return (
    <div className="">

      <div className="p-4 bg-white flex flex-row justify-center items-center gap-4">
      <Button onClick={init}>初始化</Button>
      <Button onClick={init}>退出房间</Button>
      </div>

      <div className="max-w-6xl mx-auto">

        <div className="grid grid-cols-4 gap-4">
          <video className="w-full" playsInline autoPlay ref={Mine}></video>
        </div>
        <div className="mt-4">
          <div className="flex flex-row gap-4">
            <Dropdown
              direction="right"
              hideAfterItemClick
              maxColumnWidth={100}
              maxHeight={300}
              minColumnWidth={10}
              options={videoInputOptions()}
              disabled={videoInputs.length === 0}
              placement="bottom-left"
              trigger="hover"
            >
              <Button
                block={false}
                ghost={false}
                loading={videoInputs.length === 0 && inited}
                disabled={videoInputs.length === 0 || !inited}
                shape="circle"
                size="medium"
                type="button"
                variant="base"
                icon={<ServiceIcon />}
              />
            </Dropdown>
            <Dropdown
              direction="right"
              hideAfterItemClick
              maxColumnWidth={100}
              maxHeight={300}
              minColumnWidth={10}
              options={videoInputOptions()}
              disabled={videoInputs.length === 0}
              placement="bottom-left"
              trigger="hover"
              onClick={handleVideoInputChange}
            >
              <Button
                block={false}
                ghost={false}
                loading={videoInputs.length === 0 && inited}
                disabled={videoInputs.length === 0 || !inited}
                shape="circle"
                size="medium"
                type="button"
                variant="base"
                icon={<PhotoIcon />}
              />
            </Dropdown>
            <Button
                block={false}
                ghost={false}
                loading={videoInputs.length === 0 && inited}
                disabled={videoInputs.length === 0 || !inited}
                shape="circle"
                size="medium"
                type="button"
                variant="base"
                icon={<DesktopIcon />}
              />
          </div>
        </div>
      </div>
    </div>
  );
}

export default JanusTest;
