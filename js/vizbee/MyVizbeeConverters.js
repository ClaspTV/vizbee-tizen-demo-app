/**
 * MyVizbeeConverters class provides static methods for converting between
 * the application's video format and Vizbee's VideoInfo format.
 * 
 * This is a vizbee template file
 */
export default class MyVizbeeConverters {

    /**
     * Converts the application's video instance to Vizbee's VideoInfo format.
     * 
     * @param {Object} myVideoInstance - The application's video object.
     * @param {string} myVideoInstance.streamId - Unique identifier for the video stream.
     * @param {string} myVideoInstance.title - Title of the video.
     * @param {string} myVideoInstance.imageUrl - URL of the video thumbnail image.
     * @param {boolean} myVideoInstance.isLive - Indicates if the video is a live stream.
     * @param {string} myVideoInstance.streamUrl - URL of the video stream.
     * 
     * @returns {vizbee.continuity.messages.VideoInfo|undefined} Vizbee VideoInfo object or undefined if input is invalid.
     */
    static toVideoInfo(myVideoInstance) {
        if (!myVideoInstance) {
            return undefined;
        }
    
        // Convert the application's VideoInstance to Vizbee's VideoInfo
        let vInfo = new vizbee.continuity.messages.VideoInfo();
        vInfo.guid = myVideoInstance.streamId;
        vInfo.title = myVideoInstance.title;
        vInfo.imgUrl = myVideoInstance.imageUrl;
        vInfo.isLive = myVideoInstance.isLive; // true if content is live, false otherwise
        vInfo.videoUrl = myVideoInstance.streamUrl;
    
        return vInfo;
    }
    
    /**
     * Converts Vizbee's VideoInfo to the application's video format.
     * 
     * @param {vizbee.continuity.messages.VideoInfo} videoInfo - Vizbee's VideoInfo object.
     * @param {string} videoInfo.title - Title of the video.
     * @param {string} videoInfo.guid - Unique identifier for the video.
     * @param {string} videoInfo.videoUrl - URL of the video stream.
     * @param {string} videoInfo.imgUrl - URL of the video thumbnail image.
     * @param {boolean} videoInfo.isLive - Indicates if the video is a live stream.
     * @param {number} [videoInfo.startTime] - Start time of the video in milliseconds.
     * 
     * @returns {Object} The application's video object.
     */
    static fromVideoInfo(videoInfo) {
        // Convert Vizbee's VideoInfo to the application's video format
        // App's videoInfo format:
        // {
        //     "title": "",
        //     "streamId": "",
        //     "streamUrl": "",
        //     "imageUrl": "",
        //     "isLive": false
        //     "startTime": 300000 // milliseconds
        // }

        return {
            "title": videoInfo.title,
            "streamId": videoInfo.guid,
            "streamUrl": videoInfo.videoUrl,
            "imageUrl": videoInfo.imgUrl,
            "isLive": videoInfo.isLive,
            "startPosition": videoInfo.startTime
        };
    }
}