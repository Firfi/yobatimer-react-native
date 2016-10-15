const Sound = require('react-native-sound');

let currentPlaying = undefined;

const play = (file) => () => {
    if (currentPlaying) {
        currentPlaying.stop();
        currentPlaying = undefined;
    }
    file.play();
    currentPlaying = file;
};

export const beep = play(new Sound('beep.wav', Sound.MAIN_BUNDLE, function(err) {if (err) console.warn(err)}));
export const bell1 = play(new Sound('bell1.wav', Sound.MAIN_BUNDLE));
export const bell3 = play(new Sound('bell3.wav', Sound.MAIN_BUNDLE));