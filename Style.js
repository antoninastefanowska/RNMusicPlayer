import { StyleSheet, Platform, StatusBar } from 'react-native';

export const GRADIENT_COLORS = ['#FE65A4', '#AC1961'];
export const ICON_SIZE = 40
export const CONTRAST_COLOR = '#97EAD2';
export const DARK_COLOR = '#792359';
export const LIGHT_COLOR = '#FFB9E2';

const DARK_COLOR_TRANSPARENT = '#792359AA';
const LIGHT_COLOR_TRANSPARENT = '#FFB9E2AA';

export default StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
    },

    elementContainer: {
        marginTop: 5,
        marginBottom: 5,
        padding: 5,
        backgroundColor: LIGHT_COLOR_TRANSPARENT,
        alignItems: 'center'
    },

    elementContainerSelected: {
        marginTop: 5,
        marginBottom: 5,
        padding: 5,
        backgroundColor: DARK_COLOR_TRANSPARENT,
        alignItems: 'center'
    },

    controlsContainer: {
        padding: 5,
        backgroundColor: LIGHT_COLOR_TRANSPARENT
    },

    horizontalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center'
    },

    verticalContainer: {
        margin: 2,
        flexDirection: 'column',
        alignItems: 'center',
        alignSelf: 'center'
    },

    verticalContainerStretch: {
        flex: 1,
        margin: 2,
        flexDirection: 'column',
        alignItems: 'center',
        alignSelf: 'center'
    },

    label: {
        fontSize: 15,
        flex: 1,
        fontWeight: 'bold',
        flexWrap: 'wrap',
        textAlign: 'center',
        margin: 3,
        color: DARK_COLOR
    },

    labelSelected: {
        fontSize: 15,
        flex: 1,
        fontWeight: 'bold',
        flexWrap: 'wrap',
        textAlign: 'center',
        margin: 3,
        color: LIGHT_COLOR
    },

    italicLabel: {
        fontSize: 15,
        flex: 1,
        fontStyle: 'italic',
        flexWrap: 'wrap',
        margin: 3,
        color: DARK_COLOR
    },

    italicLabelSelected: {
        fontSize: 15,
        flex: 1,
        fontStyle: 'italic',
        flexWrap: 'wrap',
        margin: 3,
        color: LIGHT_COLOR
    },

    bigLabel: {
        fontSize: 20,
        padding: 0,
        marginTop: 0,
        marginBottom: 0,
        fontWeight: 'bold',
        marginRight: 5,
        color: DARK_COLOR
    },

    bigLabelLight: {
        fontSize: 20,
        padding: 0,
        marginTop: 0,
        marginBottom: 0,
        fontWeight: 'bold',
        marginRight: 5,
        color: LIGHT_COLOR
    },

    smallLabel: {
        fontSize: 12,
        color: DARK_COLOR
    },

    input: {
        flex: 1,
        padding: 5,
        fontSize: 17,
        fontWeight: 'bold',
        color: LIGHT_COLOR
    },

    checkbox: {
        margin: 1
    },

    playerButton: {
        alignSelf: 'center',
        color: DARK_COLOR
    },

    playerButtonSelected: {
        alignSelf: 'center',
        color: LIGHT_COLOR
    },

    playerButtonContainer: {
        alignContent: 'center',
        flex: 1
    },

    removeButtonContainer: {
        alignContent: 'center'
    },

    volumeSlider: {
        flex: 2
    },
    
    addSongsContainer: {
        margin: 5,
        justifyContent: 'center',
        alignItems: 'flex-end'
    },

    confirmContainer: {
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: DARK_COLOR_TRANSPARENT
    },

    marqueeContainer: {
        flex: 2,
        paddingTop: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },

    marquee: {
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
        textAlignVertical: 'center',
        color: DARK_COLOR
    }
});