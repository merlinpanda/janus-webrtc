import { useRef, useState } from "react";
import Janus, { JanusJS } from "../utils/janus/janus";
import adapter from 'webrtc-adapter';
import { NotificationPlugin, Button } from "tdesign-react";

const HOST = 'http://localhost:8088/janus'

// 1. join
// 2. sendOffer ---> get offer(jsep)
// 3. sendIceCandidate

function VideoRoom () {
  const Mine = useRef<HTMLVideoElement>(null);

  let janus: Janus;

  let opaqueId =  "videoroomtest-" + Janus.randomString(12);

  let sfutest: JanusJS.PluginHandle, myid, mypvtid;

  var localTracks: object = {}, localVideos = 0;

  const publishOwnFeed = (useAudio: boolean) => {
    sfutest.createOffer({
      media: { audioRecv: false, videoRecv: false, audioSend: useAudio, videoSend: true },
      success: (jsep: any) => {
        Janus.log("Got publisher SDP!", jsep);
        var publish = { request: "configure", audio: useAudio, video: true };
        // if(acodec)
				// 	publish["audiocodec"] = acodec;
				// if(vcodec)
				// 	publish["videocodec"] = vcodec;
				sfutest.send({ message: publish, jsep: jsep });
      },
      error: function(error) {
				Janus.error("WebRTC error:", error);
				if(useAudio) {
					 publishOwnFeed(false);
				} else {
          Janus.log("WebRTC error... " + error.message)
				}
			}
    })

    // sfutest.createAnswer
  }

  const janusAttatch = () => {
    janus.attach({
      plugin: 'janus.plugin.videoroom',
      opaqueId: opaqueId,
      success: (pluginHandle) => {
        Janus.log('plugin handle', pluginHandle)
        sfutest = pluginHandle;
      },
      error: (error) => {
        Janus.error("  -- Error attaching plugin...", error);
      },
      onmessage: (msg, jsep) => {
        Janus.log(" ::: Got a message (publisher) :::", msg);
        var event = msg["videoroom"];
        Janus.log("Event: " + event);
        if (event) {
          if (event === 'joined') {
            myid = msg["id"];
            mypvtid = msg["private_id"];
            Janus.log("Successfully joined room " + msg["room"] + " with ID " + myid);

            publishOwnFeed(true);
          }
        }

        if (jsep) {
          sfutest.handleRemoteJsep({ jsep: jsep });
        }
      },
      consentDialog: (on) => {
        Janus.debug("[consentDialog] Consent dialog should be " + (on ? "on" : "off") + " now");
      },
      iceState: (state) => {
        Janus.log("[iceState] ICE state changed to " + state);
      },
      onlocaltrack: (track, on) => {
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
      },
      onremotetrack: (track, mid, on) => {
        Janus.debug("remote track " + (on ? "added" : "removed") + ":", track, mid);
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
      oncleanup: () => {
        Janus.log("[oncleanup]");
      }
    })
  }

  const doStart = () => {
    // 初始化Janus
    Janus.init({
      debug: "all",
      dependencies: Janus.useDefaultDependencies({ adapter }),
      callback: () => {
        if (! Janus.isWebrtcSupported()) {
          NotificationPlugin.info({
            title: 'Alert',
            content: 'No WebRTC support...',
            duration: 3000,
            placement: "bottom-right"
          });

          return;
        }

        janus = new Janus({
          server: HOST,
          success: () => {
            janusAttatch()
          },
          error: function(error) {
						Janus.error(error);
					},
					destroyed: function() {
						window.location.reload();
					}
        })
      }
    })
  }


  const joinRoom = () => {
    var register = {
      request: "join",
      room: 1234,
      ptype: "publisher",
      display: 'jaosn'
    };
    sfutest.send({ message: register });
  }


  return (
    <div>
      <div className="bg-white p-4 flex flex-row justify-center items-center gap-3">
        <Button onClick={doStart}>开始</Button>
        <Button onClick={joinRoom}>加入房间</Button>
        <Button onClick={doStart}>禁言</Button>
        <Button onClick={doStart}>关闭摄像头</Button>
      </div>
      <div className="p-4 bg-slate-100">
        <div className="grid grid-cols-6 gap-4">
          <div>
            <video className="video-style" playsInline autoPlay ref={Mine} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoRoom;
