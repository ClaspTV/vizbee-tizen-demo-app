import MyVizbeeConverters from '../vizbee/MyVizbeeConverters';

/**
 * PlayerScreen class manages the video player functionality and integration with Vizbee.
 */
export default class PlayerScreen {
	/**
     * Initialize the PlayerScreen instance.
     */
    constructor(mediaList) {
        this.mediaList = mediaList; // Videos list to be shown in the grid
        this.player = null;         // Will hold the Bitmovin player instance
        this.currentPlayingVideoInfo = null;  // Stores information about the currently playing video
    }

    /**
     * Initialize the player screen by loading the media list and setting up the player.
     */
    init() {
        this.setupPlayer();
        this.setupControllerEvents();
    }

    /**
     * Set up the Bitmovin player with necessary modules and configuration.
     */
    setupPlayer() {
        // Add all necessary (and loaded) modules to the player core
        bitmovin.player.core.Player.addModule(window.bitmovin.player.polyfill.default);
        bitmovin.player.core.Player.addModule(window.bitmovin.player['engine-bitmovin'].default);
        bitmovin.player.core.Player.addModule(window.bitmovin.player['container-mp4'].default);
        bitmovin.player.core.Player.addModule(window.bitmovin.player['container-ts'].default);
        bitmovin.player.core.Player.addModule(window.bitmovin.player.mserenderer.default);
        bitmovin.player.core.Player.addModule(window.bitmovin.player.abr.default);
        bitmovin.player.core.Player.addModule(window.bitmovin.player.drm.default);
        bitmovin.player.core.Player.addModule(window.bitmovin.player.xml.default);
        bitmovin.player.core.Player.addModule(window.bitmovin.player.dash.default);
        bitmovin.player.core.Player.addModule(window.bitmovin.player.hls.default);
        bitmovin.player.core.Player.addModule(window.bitmovin.player.crypto.default);
        bitmovin.player.core.Player.addModule(window.bitmovin.player.style.default);
        bitmovin.player.core.Player.addModule(window.bitmovin.player.tizen.default);

        const bufferConfig = {};
        const bufferLevels = {};
        bufferLevels[bitmovin.player.core.BufferType.ForwardDuration] = 30;
        bufferLevels[bitmovin.player.core.BufferType.BackwardDuration] = 10;
        bufferConfig[bitmovin.player.core.MediaType.Video] = bufferLevels;
        bufferConfig[bitmovin.player.core.MediaType.Audio] = bufferLevels;

        // Player configuration
        const conf = {
            key: "b55933e9-e033-4e73-bc59-a60e9133fb11",
            playback: {
                autoplay: true,
            },
            tweaks: {
                file_protocol: true,
                app_id: "com.vizbeehomesso.demoapp",
                BACKWARD_BUFFER_PURGE_INTERVAL: 10,
            },
            buffer: bufferConfig,
            ui: false,
        };

        // Initialize the player
        const container = document.getElementById('player');
        this.player = new bitmovin.player.core.Player(container, conf);
        
        // Set up event listeners
        this.player.on(bitmovin.player.core.PlayerEvent.PlaybackFinished, () => {
            this.simulateKeyDown(10009);
        });
        this.player.on(bitmovin.player.core.PlayerEvent.Ready, () => {
            
            // [BEGIN] Vizbee Integration

            // send player instance to vizbee
            // this will make sure to get player events
			this.createAndSetPlayerAdapter(this.player);
            
            // send videoInfo to vizbee
            this.updateVideoInfo(this.currentPlayingVideoInfo);

            // [END] Vizbee Integration
        });
        this.player.on(bitmovin.player.core.PlayerEvent.Warning, (data) => {
            console.log("Warning Event: " + JSON.stringify(data));
        });
        this.player.on(bitmovin.player.core.PlayerEvent.Error, (data) => {
            console.log("Error Event: " + JSON.stringify(data));
        });

        // Set up UI manager
        const uiManager = new bitmovin.playerui.UIFactory.buildDefaultTvUI(this.player);
        // Remove default keydown event listeners to prevent conflicts
        document.removeEventListener('keydown', uiManager.focusVisibilityTracker.eventHandlerMap.keydown, true);
        document.removeEventListener('keydown', uiManager.currentUi.spatialNavigation.handleKeyEvent, true);
    }

    /**
     * Set up controller events for Tizen TV.
     */
    setupControllerEvents() {
        if (window.tizen) {
            tizen.tvinputdevice.registerKey('MediaPlayPause');
            tizen.tvinputdevice.registerKey('ColorF0Red');
        }
    }

    /**
     * Toggle between play and pause states.
     */
    togglePlayPause() {
        if (this.player.isPlaying()) {
            this.player.pause();
        } else {
            this.player.play();
        }
    }

    /**
     * Handle left arrow key press (seek backward).
     */
    handleLeftArrow() {
        try {
            let time = this.player.getCurrentTime() - 30;
            this.player.seek(time);
        } catch (e) {
            console.log("Failed to seek backward", e);
        }
    }

    /**
     * Handle right arrow key press (seek forward).
     */
    handleRightArrow() {
        try {
            let time = this.player.getCurrentTime() + 30;
            this.player.seek(time);
        } catch (e) {
            console.log("Failed to seek forward", e);
        }
    }

    /**
     * Handle play/pause button press.
     */
    handlePlayPause() {
        this.togglePlayPause();
    }

    /**
     * Handle enter key press.
     */
    handleEnter() {
        this.togglePlayPause();
    }

    /**
     * Handle back button press.
     */
    handleBack() {
        this.player.unload();

        // [BEGIN] Vizbee Integration

        this.sendStopVideoToVizbee();

        // [END] Vizbee Integration
    }

    /**
     * Start playing a video from the media list.
     * @param {number} currentVideoIndex - Index of the video in the media list.
     */
    handleStartVideo(currentVideoIndex) {
        this.currentPlayingVideoInfo = this.mediaList[currentVideoIndex];
        const source = {
            title: this.currentPlayingVideoInfo.title,
            hls: this.currentPlayingVideoInfo.streamUrl,
        };
        this.player.load(source);
    }

    /**
     * Simulate a keydown event.
     * @param {number} keyCode - The key code to simulate.
     */
    simulateKeyDown(keyCode) {
        const event = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            keyCode: keyCode,
            which: keyCode,
            key: String.fromCharCode(keyCode),
            code: 'Key' + String.fromCharCode(keyCode)
        });
        
        event.preventDefault = function() {};
        document.dispatchEvent(event);
    }

    // [BEGIN] Vizbee Integration

    /**
     * Create and set the Vizbee player adapter.
     * @param {Object} playerInstance - The Bitmovin player instance.
     */
    createAndSetPlayerAdapter(playerInstance) {
        if (window.vizbee && playerInstance) {
            const vzbInstance = vizbee.continuity.ContinuityContext.getInstance();
            const currentVizbeePlayerAdapter = vzbInstance.getPlayerAdapter();
            if(!currentVizbeePlayerAdapter) {
                const vzbPlayerAdapter = new window.vizbee.continuity.adapters.PlayerAdapter(vizbee.continuity.adapters.PlayerType.BITMOVIN, playerInstance);
                vzbInstance.setPlayerAdapter(vzbPlayerAdapter);
            }
        }
    }

    /**
     * Update the video information for Vizbee.
     * @param {Object} myAppVideoObject - The video object from the application.
     */
    updateVideoInfo(myAppVideoObject) {
        const vizbeeVideoInfo = MyVizbeeConverters.toVideoInfo(myAppVideoObject);
        if (vizbeeVideoInfo && window.vizbee) {
            const vzbInstance = vizbee.continuity.ContinuityContext.getInstance();
            const playerAdapter = vzbInstance.getPlayerAdapter();
            if (playerAdapter) {
                playerAdapter.updateVideoInfo(vizbeeVideoInfo);
            }
        }
    }

    /**
     * Handle deeplink video playback.
     * @param {Object} deeplinkVideoInfo - Video information from the deeplink.
     */
    handleDeeplink(deeplinkVideoInfo) {
        this.currentPlayingVideoInfo = deeplinkVideoInfo;
        let source = {
            title: this.currentPlayingVideoInfo.title,
            hls: this.currentPlayingVideoInfo.streamUrl,
        };
        if(!this.currentPlayingVideoInfo.isLive 
            && !isNaN(this.currentPlayingVideoInfo.startPosition)
            && this.currentPlayingVideoInfo.startPosition > 0) {
                source.options = {
                    startOffset: this.currentPlayingVideoInfo.startPosition/1000
                }
        }
        this.player.load(source);
    }

    /**
     * Send stop video signal to Vizbee.
     */
    sendStopVideoToVizbee() {
        if (window.vizbee) {
            const vzbInstance = vizbee.continuity.ContinuityContext.getInstance();
            vzbInstance.stopVideo();
        }
    }

    // [END] Vizbee Integration
}