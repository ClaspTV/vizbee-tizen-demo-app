import MyVizbeeConverters from './MyVizbeeConverters';

let sInstance = undefined;

/**
 * MyVizbeeHandlers class manages Vizbee-related event handling and interactions.
 * It follows the Singleton pattern to ensure only one instance exists.
 * 
 * This is a vizbee template file.
 */
export default class MyVizbeeHandlers {

    /**
     * Get the singleton instance of MyVizbeeHandlers.
     * If the instance doesn't exist, it creates one and associates it with the given playerScreen.
     * 
     * @param {Object} playerScreen - The player screen object to associate with the handler.
     * @returns {MyVizbeeHandlers} The singleton instance of MyVizbeeHandlers.
     */
    static getInstance(playerScreen) {
        if (undefined === sInstance) {
            sInstance = new MyVizbeeHandlers();
            sInstance.playerScreen = playerScreen;
        }
        return sInstance;
    }

    /**
     * Handles start video deeplink events received from the mobile device.
     * Converts the Vizbee VideoInfo to the app's internal format and triggers video playback.
     *
     * @param {vizbee.continuity.messages.VideoInfo} videoInfo - The video information from Vizbee.
     * @param {string} videoInfo.guid - Video content id.
     * @param {string} videoInfo.title - Video content title.
     * @param {string} videoInfo.imgUrl - Video content image URL.
     * @param {boolean} videoInfo.isLive - Indicates if the content is live (true) or VOD (false).
     * @param {string} videoInfo.videoUrl - Video content URL.
     * @param {number} videoInfo.startTime - Video resume time in milliseconds.
     * @param {string} [videoInfo.subtitle] - Optional video content subtitle.
     * @param {string} [videoInfo.desc] - Optional video content description.
     */
    deeplinkHandler(videoInfo) {
        // 1. Convert Vizbee VideoInfo to the app's internal video data structure
        const myVideo = MyVizbeeConverters.fromVideoInfo(videoInfo);
        
        // 2. Deeplink and play this video at the right resume position
        sInstance.playerScreen.handleDeeplink(myVideo);
    }
    
    /**
     * Handles signin events received from the mobile app.
     * This method should be implemented if signin functionality is required.
     *
     * @param {vizbee.continuity.messages.VizbeeEvent} signInEvent - The signin event from Vizbee.
     * @param {string} signInEvent.type - Event type (should be "tv.vizbee.homesign.signin").
     * @param {Object} signInEvent.data - Object containing signin event data.
     * @param {Object} signInEvent.data.authInfo - Authentication information.
     * @param {string} signInEvent.data.authInfo.userFullName - User's full name.
     * @param {string} signInEvent.data.authInfo.accessToken - Access token for authentication.
     * @param {string} signInEvent.data.authInfo.userLogin - User's login identifier.
     * @param {string} signInEvent.data.authInfo.userId - User's unique identifier.
     * @param {string} signInEvent.data.authInfo.refreshToken - Refresh token for authentication.
     */
    signInHandler(signInEvent) {
        // Handle signin event
        if (signInEvent && signInEvent.data) {
            var userAuthInfo = signInEvent.data.authInfo;
            if (
                userAuthInfo &&
                userAuthInfo.userLogin &&
                userAuthInfo.userId &&
                userAuthInfo.refreshToken
            ) {
                // TODO: Implement your app's signin method here
                console.log("Sign-in event received. Implement your signin logic here.");
            }
        }
    }
        
    /**
     * Handles custom Vizbee events.
     * This method should be implemented if custom event handling is required.
     *
     * @param {vizbee.continuity.messages.VizbeeEvent} eventInfo - The custom event information.
     * @param {string} eventInfo.type - Custom event namespace.
     * @param {Object} eventInfo.data - Custom event data.
     */
    vizbeeEventHandler(eventInfo) {
        // TODO: Implement custom event handling logic here
        console.log("Custom Vizbee event received:", eventInfo);
    }
}