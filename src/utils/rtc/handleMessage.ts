import { JanusJS } from "../janus/janus";
import { RTCCmds } from "./defines";
import { VideoRoomRole } from "./defines/user";

interface MessageInterface {
  request: RTCCmds;
}

interface JoinMessage extends MessageInterface {
  room: number;
  ptype: VideoRoomRole;
  display: string;
}

interface HandleMessageType {
  handle: JanusJS.PluginHandle,
  message: MessageInterface
}

interface HandleJoinRoom extends HandleMessageType {
  message: JoinMessage
}

// 发送句柄消息
class HandleMessage {

  static send = async (props: HandleMessageType) => {
    return new Promise((resolve, reject) => {
      let handle = props.handle;
      handle.send({
        message: props.message,
        success: () => {
          return resolve('');
        },
        error: (e) => {
          return reject(e);
        }
      })
    })
  }

  static joinRoom = async (props: HandleJoinRoom) => {
    return new Promise((resolve, reject) => {
      let handle = props.handle;
      handle.send({
        message: props.message,
        success: () => {
          return resolve('');
        },
        error: (e) => {
          return reject(e);
        }
      })
    })
  }
}

export default HandleMessage;
