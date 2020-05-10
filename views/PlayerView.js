import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, Slider, Easing } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import DraggableFlatList from 'react-native-draggable-flatlist';
import TextTicker from 'react-native-text-ticker';

import { Audio } from 'expo-av';
import * as Permissions from 'expo-permissions';

import MusicInfo from '../MusicInfo';
import Style, { GRADIENT_COLORS, ICON_SIZE, DARK_COLOR, CONTRAST_COLOR } from '../Style';

const NEXT_NORMAL = 0;
const NEXT_LOOP_ALL = 1;
const NEXT_LOOP_SINGLE = 2;
const NEXT_RANDOM = 3;

const NEXT_MODE_ICONS = ['long-arrow-right', 'refresh', 'repeat', 'random'];

class PlayerView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            currentSong: null,
            loading: false,
            playbackProgress: 0,
            currentVolume: 1.0,
            nextSongMode: NEXT_NORMAL,
            isPlaying: false
        }
        this.timer = null;
        this.idCounter = 0;
        this.currentPosition = 0;
        this.currentDuration = 0;
        this.isPositionChanging = false;

        this.soundObject = new Audio.Sound();

        this.onResume = this.onResume.bind(this);
        this.tick = this.tick.bind(this);

        this.onAddFilesPressed = this.onAddFilesPressed.bind(this);
        this.removeSong = this.removeSong.bind(this);
        this.selectSong = this.selectSong.bind(this);
        this.selectNextSong = this.selectNextSong.bind(this);
        this.selectPreviousSong = this.selectPreviousSong.bind(this);
        this.changeNextSongMode = this.changeNextSongMode.bind(this);
        this.changePosition = this.changePosition.bind(this);
        this.positionChanged = this.positionChanged.bind(this);
        this.changeVolume = this.changeVolume.bind(this);
        this.volumeChanged = this.volumeChanged.bind(this);
        this.songDragged = this.songDragged.bind(this);
        
        this.playMusic = this.playMusic.bind(this);
        this.pauseMusic = this.pauseMusic.bind(this);
        this.stopMusic = this.stopMusic.bind(this);
        this.onPlaybackStatusUpdate = this.onPlaybackStatusUpdate.bind(this);
        this.advance = this.advance.bind(this);
        this.rewind = this.rewind.bind(this);
        this.volumeUp = this.volumeUp.bind(this);
        this.volumeDown = this.volumeDown.bind(this);
        this.soundObject.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate);
    }

    render() {
        return (
            <LinearGradient colors={GRADIENT_COLORS} style={Style.container}>
                <TouchableOpacity style={Style.addSongsContainer} onPress={this.onAddFilesPressed}>
                    <View style={Style.horizontalContainer}>
                        <Text style={Style.bigLabel}>DODAJ UTWORY</Text>
                        <FontAwesome name='plus' size={ICON_SIZE} style={Style.playerButton} />
                    </View>
                </TouchableOpacity>
                <ProgressBar indeterminate={true} color={CONTRAST_COLOR} visible={this.state.loading} />
                 <DraggableFlatList 
                    data={this.state.data}
                    renderItem={({item, index, drag, isActive}) => (<MusicItem musicItem={item} onItemPressed={this.selectSong} onItemRemoved={this.removeSong} drag={drag} isDragged={isActive} />)}
                    keyExtractor={item => item.id} 
                    onDragEnd={this.songDragged} />
                <View style={Style.controlsContainer}>
                    <View style={Style.horizontalContainer}>
                        <View style={Style.verticalContainerStretch}>
                            { this.state.currentSong && this.state.currentSong.picture &&
                                (<Image style={{width: 150, height: 150}} resizeMode='contain' source={{ uri: this.state.currentSong.picture.pictureData }} />) }
                            { (!this.state.currentSong || !this.state.currentSong.picture) &&
                                (<FontAwesome name='music' size={150} style={Style.playerButton} />) }
                        </View>
                        <View style={Style.verticalContainerStretch}>
                            <View style={Style.verticalContainerStretch} />
                            <View style={Style.horizontalContainer}>
                                <TouchableOpacity style={Style.playerButtonContainer} onPress={this.changeNextSongMode}>
                                    <FontAwesome name={NEXT_MODE_ICONS[this.state.nextSongMode]} size={ICON_SIZE} style={Style.playerButton} />
                                </TouchableOpacity>
                            </View>                               
                            <View style={Style.horizontalContainer}>
                                <TouchableOpacity style={Style.playerButtonContainer} onPress={this.volumeDown}>
                                    <FontAwesome name='volume-down' size={ICON_SIZE} style={Style.playerButton} />
                                </TouchableOpacity>
                                <Slider style={Style.volumeSlider} value={this.state.currentVolume} minimumValue={0.0} maximumValue={1.0} minimumTrackTintColor={CONTRAST_COLOR} thumbTintColor={DARK_COLOR} onValueChange={this.changeVolume} onSlidingComplete={this.volumeChanged} />
                                <TouchableOpacity style={Style.playerButtonContainer} onPress={this.volumeUp}>
                                    <FontAwesome name='volume-up' size={ICON_SIZE} style={Style.playerButton} />
                                </TouchableOpacity>
                            </View>
                        </View>                 
                    </View>
                    <View style={Style.verticalContainer}>
                        <View style={Style.horizontalContainer}>
                            <TouchableOpacity style={Style.playerButtonContainer} onPress={this.selectPreviousSong}>
                                <FontAwesome name='fast-backward' size={ICON_SIZE} style={Style.playerButton} />
                            </TouchableOpacity>
                            <View style={Style.marqueeContainer}>
                                <TextTicker style={Style.label} duration={5000} animationType='scroll' easing={Easing.linear}>
                                    {this.state.currentSong ? (this.state.currentSong.title ? this.state.currentSong.title + (this.state.currentSong.artist ? ' - ' + this.state.currentSong.artist : '') : this.state.currentSong.filename) : 'Nie wybrano żadnego utworu'}
                                </TextTicker>
                            </View>
                            <TouchableOpacity style={Style.playerButtonContainer} onPress={this.selectNextSong}>
                                <FontAwesome name='fast-forward' size={ICON_SIZE} style={Style.playerButton} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={Style.verticalContainer}>
                        <View style={Style.horizontalContainer}>    
                            <TouchableOpacity style={Style.playerButtonContainer} onPress={this.rewind}>
                                <FontAwesome name='backward' size={ICON_SIZE} style={Style.playerButton} />
                            </TouchableOpacity>
                            { !this.state.isPlaying &&
                                (<TouchableOpacity style={Style.playerButtonContainer} onPress={this.playMusic}>
                                    <FontAwesome name='play' size={ICON_SIZE} style={Style.playerButton} />
                                </TouchableOpacity>) }
                            { this.state.isPlaying &&
                                (<TouchableOpacity style={Style.playerButtonContainer} onPress={this.pauseMusic}>
                                  <FontAwesome name='pause' size={ICON_SIZE} style={Style.playerButton} />
                                </TouchableOpacity>) }
                            <TouchableOpacity style={Style.playerButtonContainer} onPress={this.stopMusic}>
                                <FontAwesome name='stop' size={ICON_SIZE} style={Style.playerButton} />
                            </TouchableOpacity>
                            <TouchableOpacity style={Style.playerButtonContainer} onPress={this.advance}>
                                <FontAwesome name='forward' size={ICON_SIZE} style={Style.playerButton} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Slider style={Style.positionSlider} value={this.state.playbackProgress} minimumValue={0.0} maximumValue={1.0} minimumTrackTintColor={CONTRAST_COLOR} thumbTintColor={DARK_COLOR} onValueChange={this.changePosition} onSlidingComplete={this.positionChanged} />
                </View>
            </LinearGradient>
        );
    }

    getRandom(max) {
        max = Math.floor(max);
        return Math.floor(Math.random() * max);
    }

    componentDidMount() {
        this.timer = setInterval(this.tick, 500);
        this.props.navigation.addListener('focus', this.onResume);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        this.props.navigation.removeListener('focus', this.onResume);
    }

    onResume() {
        if (this.props.route.params && this.props.route.params.newFiles)
            this.loadNewFiles();
    }

    updateStateProperty(property, value) {
        let newState = this.state;
        newState[property] = value;
        this.setState(newState);
    }

    updateStateProperties(...properties) {
        let newState = this.state;
        for (let i = 0; i < properties.length; i++)
            newState[properties[i].name] = properties[i].value;
        this.setState(newState);
    }

    async loadNewFiles() {
        let newFiles = this.props.route.params.newFiles;
        this.updateStateProperty('loading', true);
        let newData = this.state.data;
        for (let newFile of newFiles) {
            newFile.id = (this.idCounter++).toString();
            let metadata = await MusicInfo.getMusicInfoAsync(newFile.uri, {
                title: true,
                artist: true,
                album: false,
                genre: false,
                picture: true
            });
            if (metadata != null) {
                newFile.title = metadata.title;
                newFile.artist = metadata.artist;
                newFile.album = metadata.album;
                newFile.genre = metadata.genre;
                newFile.picture = metadata.picture;
            }
            newData.push(newFile);
        }
        this.updateStateProperties(
            { name: 'data', value: newData },
            { name: 'loading', value: false }
        );
        this.props.route.params.newFiles = null;
    }

    async onAddFilesPressed() {
        let permission = await Permissions.getAsync(Permissions.CAMERA_ROLL);
        if (!permission.granted) {
            permission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (permission.granted)
                this.props.navigation.navigate('Browse');
        } else
            this.props.navigation.navigate('Browse');
    }

    removeSong(song) {
        let newData = this.state.data;
        let index = newData.indexOf(song);
        newData.splice(index, 1);
        this.updateStateProperty('data', newData);
    }

    async selectSong(song) {
        if (this.state.currentSong)
            this.state.currentSong.isCurrent = false;
        song.isCurrent = true;
        this.updateStateProperty('currentSong', song);
        await this.soundObject.unloadAsync();
        await this.soundObject.loadAsync({ uri: song.uri });
        if (this.state.isPlaying)
            this.soundObject.playAsync();
    }

    async playMusic() {
        if (!this.state.currentSong)
            await this.selectNextSong();
        if (this.state.currentSong) {
            this.updateStateProperty('isPlaying', true);
            this.soundObject.playAsync();
        }
    }

    pauseMusic() {
        if (this.state.currentSong) {
            this.updateStateProperty('isPlaying', false);
            this.soundObject.pauseAsync();
        }
    }

    stopMusic() {
        if (this.state.currentSong) {
            this.updateStateProperty('isPlaying', false);
            this.soundObject.stopAsync();
        }
    }

    getPreviousSong() {
        let index;
        switch (this.state.nextSongMode) {
            case NEXT_NORMAL:
                index = this.state.currentSong ? this.state.data.indexOf(this.state.currentSong) : this.state.data.length;
                return this.state.data[index - 1];
            case NEXT_LOOP_ALL:
                index = this.state.currentSong ? this.state.data.indexOf(this.state.currentSong) : this.state.data.length;
                if (index == 0)
                    return this.state.data[this.state.data.length - 1];
                else
                    return this.state.data[index - 1];
            case NEXT_LOOP_SINGLE:
                return this.state.currentSong;
            case NEXT_RANDOM:
                let random = this.getRandom(this.state.data.length);
                return this.state.data[random];
        }
    }

    async selectPreviousSong() {
        let previousSong = this.getPreviousSong();
        if (previousSong)
            await this.selectSong(previousSong);
        else
            this.stopMusic();
    }

    getNextSong() {
        let index;
        switch (this.state.nextSongMode) {
            case NEXT_NORMAL:
                index = this.state.currentSong ? this.state.data.indexOf(this.state.currentSong) : -1;
                return this.state.data[index + 1];
            case NEXT_LOOP_ALL:
                index = this.state.currentSong ? this.state.data.indexOf(this.state.currentSong) : -1;
                if (index == this.state.data.length - 1)
                    return this.state.data[0];
                else
                    return this.state.data[index + 1];
            case NEXT_LOOP_SINGLE:
                return this.state.currentSong;
            case NEXT_RANDOM:
                let random = this.getRandom(this.state.data.length);
                return this.state.data[random];
        }
    }

    changeNextSongMode() {
        let allModes = NEXT_RANDOM + 1;
        let currentNextSongMode = this.state.nextSongMode;
        this.updateStateProperty('nextSongMode', (currentNextSongMode + 1) % allModes);
    }

    async selectNextSong() {
        let nextSong = this.getNextSong();
        if (nextSong)
            await this.selectSong(nextSong);
        else
            this.stopMusic();
    }

    songDragged({ data }) {
        this.updateStateProperty('data', data);
    }

    advance() {
        if (this.state.currentSong) {
            let newPosition = this.currentPosition + 5000 < this.currentDuration ? this.currentPosition + 5000 : this.currentDuration;
            this.soundObject.setPositionAsync(newPosition);
        }
    }

    rewind() {
        if (this.state.currentSong) {
            let newPosition = this.currentPosition - 5000 > 0 ? this.currentPosition - 5000 : 0;
            this.soundObject.setPositionAsync(newPosition);
        }
    }

    volumeUp() {
        if (this.state.currentSong) {
            let newVolume = this.state.currentVolume + 0.1 < 1.0 ? this.state.currentVolume + 0.1 : 1.0;
            this.updateStateProperty('currentVolume', newVolume);
            this.soundObject.setVolumeAsync(newVolume);
        }
    }

    volumeDown() {
        if (this.state.currentSong) {
            let newVolume = this.state.currentVolume - 0.1 > 0.0 ? this.state.currentVolume - 0.1 : 0.0;
            this.updateStateProperty('currentVolume', newVolume);
            this.soundObject.setVolumeAsync(newVolume);
        }
    }

    changePosition() {
        this.isPositionChanging = true;
    }

    positionChanged(value) {
        if (this.state.currentSong) {
            let newPosition = Math.round(value * this.currentDuration);
            this.soundObject.setPositionAsync(newPosition);
            this.updateStateProperty('playbackProgress', value);
        }
        this.isPositionChanging = false;
    }

    changeVolume(value) {
        if (this.state.currentSong)
            this.soundObject.setVolumeAsync(value);
    }

    volumeChanged(value) {
        if (this.state.currentSong)
            this.updateStateProperty('currentVolume', value);
    }

    tick() {
        if (this.currentDuration > 0 && !this.isPositionChanging) {
            let progress = this.currentPosition / this.currentDuration;
            if (progress != this.state.playbackProgress)
                this.updateStateProperty('playbackProgress', progress);
        }
    }

    onPlaybackStatusUpdate(playbackStatus) {
        this.currentPosition = playbackStatus.positionMillis;
        this.currentDuration = playbackStatus.durationMillis;
        if (playbackStatus.didJustFinish)
            this.selectNextSong();
    }
}

function MusicItem({musicItem, onItemPressed, onItemRemoved, drag, isDragged}) {
    return (
        <TouchableOpacity onPress={() => onItemPressed(musicItem)} onLongPress={drag}>
            <View opacity={isDragged ? 0.8 : 1} style={musicItem.isCurrent ? Style.elementContainerSelected : Style.elementContainer}>
                <View style={Style.horizontalContainer}>
                    { musicItem.picture &&
                        (<Image style={{width: 50, height: 50}} resizeMode='contain' source={{uri: musicItem.picture.pictureData}} />) }
                    { !musicItem.picture &&
                        (<FontAwesome name='music' size={50} style={musicItem.isCurrent ? Style.playerButtonSelected : Style.playerButton} />) }
                    <View style={Style.verticalContainerStretch}>
                        <Text style={musicItem.isCurrent ? Style.labelSelected : Style.label}>{musicItem.title ? musicItem.title : musicItem.filename}</Text>
                        <Text style={musicItem.isCurrent ? Style.italicLabelSelected : Style.italicLabel}>{musicItem.artist}</Text>
                    </View>
                    <TouchableOpacity style={Style.removeButtonContainer} onPress={() => onItemRemoved(musicItem)}>
                        <FontAwesome name='remove' size={ICON_SIZE} style={musicItem.isCurrent ? Style.playerButtonSelected : Style.playerButton} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default PlayerView;