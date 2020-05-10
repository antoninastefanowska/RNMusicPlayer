import React, { Component } from 'react';
import { View, FlatList, Text, TextInput, TouchableOpacity } from 'react-native';
import { Checkbox, ProgressBar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';

import Style, { GRADIENT_COLORS, CONTRAST_COLOR, LIGHT_COLOR, ICON_SIZE } from '../Style';

class BrowseView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: false
        }
        this.selectedData = [];
        this.last = '0';
        this.hasNextPage = true;
        this.keywords = '';
        this.shouldLoad = true;

        this.renderItem = this.renderItem.bind(this);
        this.loadFiles = this.loadFiles.bind(this);
        this.onListScrolled = this.onListScrolled.bind(this);
        this.onConfirmPressed = this.onConfirmPressed.bind(this);
        this.onItemSelected = this.onItemSelected.bind(this);
        this.onSearch = this.onSearch.bind(this);
    }

    render() {
        return (
            <LinearGradient colors={GRADIENT_COLORS} style={Style.container}>
                <View style={Style.elementContainerSelected}>
                    <View style={Style.horizontalContainer}>
                        <FontAwesome name='search' size={ICON_SIZE} style={Style.playerButtonSelected} />
                        <TextInput style={Style.input} placeholder='Szukaj' placeholderTextColor={LIGHT_COLOR} autoCapitalize='none' onChangeText={this.onSearch} />
                    </View>
                </View>
                <FlatList 
                    data={this.state.data}
                    renderItem={this.renderItem}
                    keyExtractor={item => item.id}
                    onEndReached={this.loadFiles} 
                    windowSize={100}
                    onScroll={this.onListScrolled} />
                <ProgressBar indeterminate={true} color={CONTRAST_COLOR} visible={this.state.loading} />
                <TouchableOpacity style={Style.confirmContainer} onPress={this.onConfirmPressed}>
                    <Text style={Style.bigLabelLight}>ZATWIERDŹ</Text>
                </TouchableOpacity>
            </LinearGradient>
        );
    }

    renderItem({item}) {
        return (<AudioFileItem audioFileItem={item} onSelected={this.onItemSelected} />);
    }

    componentDidMount() {
        this.selectedData = [];
        this.loadFiles();
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

    async loadFiles() {
        if (!this.state.loading && this.shouldLoad && this.hasNextPage) {
            this.updateStateProperty('loading', true);
            let newData = this.state.data;
            let media = await MediaLibrary.getAssetsAsync({
                first: 50,
                after: this.last,
                mediaType: MediaLibrary.MediaType.audio
            });
            for (let file of media.assets) {
                if (this.keywords === '' || file.filename.toUpperCase().includes(this.keywords)) {
                    let audioFile = {
                        id: newData.length.toString(),
                        uri: file.uri,
                        filename: file.filename
                    }
                    newData.push(audioFile);
                }
            }
            this.updateStateProperties(
                { name: 'data', value: newData },
                { name: 'loading', value: false }
            );
            this.last = media.endCursor;
            this.hasNextPage = media.hasNextPage;
            this.shouldLoad = false;
            if (this.state.data.length < 50) {
                this.shouldLoad = true;
                this.loadFiles();
            }
        }
    }

    onSearch(text) {
        this.keywords = text.toUpperCase();
        let clearedData = this.state.data;
        clearedData.length = 0;
        this.updateStateProperty('data', clearedData);
        this.last ='0';
        this.hasNextPage = true;
        this.shouldLoad = true;
        this.loadFiles();
    }

    onListScrolled() {
        this.shouldLoad = true;
    }

    onConfirmPressed() {
        this.props.navigation.navigate('Player', { newFiles: this.selectedData });
    }

    onItemSelected(item) {
        let index = this.selectedData.indexOf(item);
        if (index == -1)
            this.selectedData.push(item);
        else
            this.selectedData.splice(index, 1);
    }
}

class AudioFileItem extends Component {
    constructor(props) {
        super(props);
        this.audioFileItem = props.audioFileItem;
        this.onSelected = props.onSelected;
        this.onChecked = this.onChecked.bind(this);
        this.state = {
            isSelected: false
        };
    }

    render() {
        return (
            <View style={Style.elementContainer}>
                <View style={Style.horizontalContainer}>
                    <Checkbox status={this.state.isSelected ? 'checked' : 'unchecked'} color={CONTRAST_COLOR} style={Style.checkbox} onPress={this.onChecked} />
                    <Text style={Style.label}>{this.audioFileItem.filename}</Text>
                </View>
            </View>
        );
    }

    onChecked() {
        this.setState({ isSelected: !this.state.isSelected });
        this.onSelected(this.audioFileItem);
    }
}

export default BrowseView;