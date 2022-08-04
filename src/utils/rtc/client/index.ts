
class Client {

  static getAudioInputDevices = async (callback: CallableFunction) => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      let auidos = devices ? devices.filter(device => {
        return device.kind === 'audioinput';
      }) : [];

      callback(auidos);
    });
  }

  static getAudioOutputDevices = async (callback: CallableFunction) => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      let auidos = devices ? devices.filter(device => {
        return device.kind === 'audiooutput';
      }) : [];

      callback(auidos);
    });
  }

  static getVideoInputDevices = (callback: CallableFunction) => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      let videos = devices ? devices.filter(device => {
        return device.kind === 'videoinput';
      }) : []

      callback(videos);
    });
  }
}

export default Client;