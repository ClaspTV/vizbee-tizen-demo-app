import PlayerScreen from './screens/PlayerScreen';
import GridScreen from './screens/GridScreen';
import ProfileScreen from './screens/ProfileScreen';
import SideNav from './SideNav.js';
import MyVizbeeHandlers from './vizbee/MyVizbeeHandlers';

/**
 * List of media keys to be registered for Tizen TV.
 */
const usedKeys = [
    'MediaFastForward', 'MediaPlayPause', 'MediaPause', 'MediaPlay',
    'MediaRewind', 'MediaStop', 'Exit', '1'
];

// Register keys for Tizen TV
usedKeys.forEach((keyName) => {
    window.tizen && 
    window.tizen.tvinputdevice && 
    window.tizen.tvinputdevice.registerKey(keyName);
});

const mediaList = [
    {
        "title": "Elephants Dream",
        "streamId": "elephants",
        "streamUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/CastVideos/hls/ElephantsDream.m3u8",
        "imageUrl": "https://vizbee.s3.amazonaws.com/images/demoapp/elephantsdream.jpg",
        "isLive": false
    },
    {
        "title": "Tears of Steel",
        "streamId": "tears",
        "streamUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/CastVideos/hls/TearsOfSteel.m3u8",
        "imageUrl": "https://vizbee.s3.amazonaws.com/images/demoapp/tearsofsteel.png",
        "isLive": false
    },
    {
        "title": "Akamai Live Stream",
        "streamId": "akamai-live-stream",
        "streamUrl": "https://livecmaftest1.akamaized.net/cmaf/live/2099281/abr6s/master.m3u8",
        "imageUrl": "https://vizbee.s3.amazonaws.com/images/demoapp/akamai-live.jpg",
        "isLive": true
    }
];

function loadWebapis() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '$WEBAPIS/webapis/webapis.js';
        script.async = false;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Global variables to manage application state
let currentFocusedScreen = 'grid';
let currentScreen = 'grid';
let gridScreen = new GridScreen(mediaList);
let playerScreen = new PlayerScreen(mediaList);
let profileScreen = new ProfileScreen();
let sideNav = new SideNav();

/**
 * Initialize the application when the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', async () => {

    try {
        await loadWebapis();
    } catch (error) {
        console.error('Failed to load webapis:', error);
    }

    gridScreen.init();
    playerScreen.init();
    profileScreen.init();

    // Initialize sidebar navigation
    sideNav.init();

    gridScreen.updateFocus();

    // Set up key event listeners
    document.addEventListener('keydown', registerForKeyListeners);

    // Handle keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebarOverlay.classList.contains('active')) {
            sidebarOverlay.classList.remove('active');
        }
    });

	// [BEGIN] Vizbee Integration

    // Initialize Vizbee integration
    loadAndInitVizbee();

	// [END] Vizbee Integration
});

/**
 * Main key event listener function.
 * Delegates to appropriate handler based on platform (Tizen or Desktop).
 * @param {KeyboardEvent} e - The keydown event object.
 */
function registerForKeyListeners(e) {
    if (!window.tizen) {
        registerForDesktopKeyboardEvents(e);
    } else {
        registerForTizenRemoteKeyEvents(e);
    }
}

/**
 * Handle keyboard events for desktop environments.
 * @param {KeyboardEvent} e - The keydown event object.
 */
function registerForDesktopKeyboardEvents(e) {
    switch (e.key) {
        case 'ArrowUp':
        case 'u':
        case 'U':
            e.preventDefault();
            if (currentFocusedScreen === 'sidebar') {
                sideNav.handleUpArrow();
            }
            break;
        case 'ArrowDown':
        case 'd':
        case 'D':
            e.preventDefault();
            if (currentFocusedScreen === 'sidebar') {
                sideNav.handleDownArrow();
            }
            break;
        case 'ArrowLeft':
        case 'l':
        case 'L':
            e.preventDefault();
            handleLeftArrow();
            break;
        case 'ArrowRight':
        case 'r':
        case 'R':
            e.preventDefault();
            handleRightArrow();
            break;
        case 'Enter':
            e.preventDefault();
            handleEnter();
            break;
        case 'Backspace':
            e.preventDefault();
            handleBack();
            break;
    }
}

/**
 * Handle remote control events for Tizen TV environments.
 * @param {KeyboardEvent} e - The keydown event object.
 */
function registerForTizenRemoteKeyEvents(e) {
    switch (Number(e.keyCode)) {
        case 38:
            e.preventDefault();
            if (currentFocusedScreen === 'sidebar') {
                sideNav.handleUpArrow();
            }
            break;
        case 40:
            e.preventDefault();
            if (currentFocusedScreen === 'sidebar') {
                sideNav.handleDownArrow();
            }
            break;
        case window.tizen && tizen.tvinputdevice.getKey('MediaPlayPause').code:
        case 19:
        case 415:
            handlePlayPause();
            break;
        case 37: // LEFT arrow
            handleLeftArrow(e);
            break;
        case 39: // RIGHT arrow
            handleRightArrow(e);
            break;
            break;
        case 13: // OK button
            handleEnter(e);
            break;
        case 413: // STOP button
        case 10009: // RETURN button
            handleBack(e);
            break;
    }
}

/**
 * Handle play/pause button press.
 */
function handlePlayPause() {
    if(currentFocusedScreen === 'player') {
        playerScreen.handlePlayPause();
    }
}

/**
 * Handle left arrow button press.
 */
function handleLeftArrow(e) {
    if(currentFocusedScreen === 'grid') {
        if(gridScreen.currentFocusedItemIndex === 0) {
            currentScreen = 'grid';
            currentFocusedScreen = 'sidebar';
            sideNav.handleLeftArrow();
        } else {
            gridScreen.handleLeftArrow();
        }
    } else if(currentFocusedScreen === 'player') {
        playerScreen.handleLeftArrow();
    } else if(currentFocusedScreen === 'profile') {
        currentFocusedScreen = 'sidebar';
        sideNav.toggleSidebar();
        sideNav.updateFocus();
    }
}

/**
 * Handle right arrow button press.
 */
function handleRightArrow(e) {
    if(currentFocusedScreen === 'sidebar') {
        sideNav.handleRightArrow();
        if(currentScreen === 'grid') {
            currentFocusedScreen = 'grid';
            gridScreen.updateFocus();
            return;
        }
        if(currentScreen === 'profile') {
            currentFocusedScreen = 'profile';
            profileScreen.updateFocus();
        }
    } else if(currentFocusedScreen === 'grid') {
        gridScreen.handleRightArrow();
    } else if(currentFocusedScreen === 'player') {
        playerScreen.handleRightArrow();
    }
}

/**
 * Handle enter/OK button press.
 */
function handleEnter(e) {
    if(currentFocusedScreen === 'grid') {
        toggleScreen('player');
        const currentVideoIndex = gridScreen.getCurrentItemIndex();
        playerScreen.handleStartVideo(currentVideoIndex);
        currentFocusedScreen = 'player';
        currentScreen = 'player';
        return;
    } 
    if(currentFocusedScreen === 'player') {
        playerScreen.handleEnter();
        return;
    }
    if(currentFocusedScreen === 'sidebar') {
        sideNav.handleEnter();
        if(sideNav.currentFocusedIndex === 0) {
            currentScreen = 'grid';
            currentFocusedScreen = 'grid';
            sideNav.switchToGrid();
            gridScreen.updateFocus();
            return;
        }
        if(sideNav.currentFocusedIndex === 1) {
            currentScreen = 'profile';
            currentFocusedScreen = 'profile';
            sideNav.switchToProfile();
            profileScreen.updateFocus();
            return;
        }
        return;
    }
    if(currentFocusedScreen === 'profile') {
        profileScreen.handleEnter();
        return;
    }
}

/**
 * Handle back button press.
 */
function handleBack(e) {
    
    if(currentFocusedScreen === 'sidebar') {
        sideNav.handleBack();
        return;
    }

    if (currentFocusedScreen === 'profile') {
        if (profileScreen) {
            if(profileScreen.isSignInInProgress) {
                profileScreen.cancelSignIn();
                return;
            } else {
                handleLeftArrow();
            }
        } 
    }

    if(currentFocusedScreen === 'grid') {
        handleLeftArrow();
        return;
    } 
    if(currentFocusedScreen === 'player') {
        playerScreen.handleBack();
        toggleScreen('grid');
        gridScreen.updateFocus();
        currentFocusedScreen = 'grid';
        currentScreen = 'grid';
        return;
    }
}

/**
 * Toggle between grid and player screens.
 */
function toggleScreen(screen) {

    document.getElementById('grid-screen').classList.add('inactive');
    document.getElementById('player-screen').classList.add('inactive');
    document.getElementById('profile-screen').classList.add('inactive');
    document.getElementById(screen+'-screen').classList.remove('inactive');

    const sidebar = document.getElementById('sidebar');
    if(screen === 'player') {
        sidebar.classList.add('inactive');
    } else {
        sidebar.classList.remove('inactive');
    }
}

// [BEGIN] Vizbee Integration

/**
 * Load and initialize the Vizbee SDK.
 * @returns {Promise} A promise that resolves when the Vizbee script is loaded.
 */
function loadAndInitVizbee() {

    let isVizbeeContinuityInitialized = false;
    let isVizbeeHomeSSOInitialized = false;
    window.addEventListener('VIZBEE_SDK_READY', () => {
        console.log(`Vizbee Continuity SDK script loaded successfully`);
        if (window.vizbee) {
            isVizbeeContinuityInitialized = true;
        }
    });

    window.addEventListener('VIZBEE_HOMESSO_READY', () => {
        console.log(`Vizbee Home SSO SDK script loaded successfully`);
        if (window.vizbeehomesso) {
            isVizbeeHomeSSOInitialized = true;
        }
    });

    // Check if both SDKs are loaded every 500ms
    const maxCount = 40; // 20 seconds
    let count = 0;
    let timerId = setInterval(() => {
        if (isVizbeeContinuityInitialized && isVizbeeHomeSSOInitialized) {
            clearInterval(timerId);
            console.log(`Both Vizbee SDKs loaded successfully`);
            count = 0;

            initVizbeeContinuity();
            initVizbeeHomeSSO();
        } else {
            count++;
            if (count >= maxCount) {
                clearInterval(timerId);
                console.log(`Vizbee SDKs loading failed`);
            }
        }
    }, 500);

    console.log(`loadAndInitVizbee - loading vizbee sdk now ...`);
    addScript("https://vzb-origin.s3.us-east-1.amazonaws.com/sdk-legacy/js-homesso-dev/vizbee_sdk.js?seed="+Math.random());
    addScript("https://vzb-origin.s3.us-east-1.amazonaws.com/sdk-legacy/js-homesso-dev/vizbee_homesso_sdk.js?seed="+Math.random());
}

function initVizbeeContinuity() {
    console.log(`initVizbeeContinuity - initiating vizbee sdk now ...`);
    const vzbInstance = window.vizbee.continuity.ContinuityContext.getInstance();
    vzbInstance.start('vzb1703223811');
    setDeeplinkHandler();
}

function initVizbeeHomeSSO() {
    console.log(`initVizbeeHomeSSO - initiating vizbee homesso sdk now ...`);
    const vzbHomeSSOContext = vizbeehomesso.HomeSSOContext.getInstance();
    const vzbHomeSSOManager = vzbHomeSSOContext.getHomeSSOManager();
    vzbHomeSSOManager.init();
    vzbHomeSSOManager.setSignInHandler((signInInfo, statusCallback) => {
        console.log('Index::setSignInHandler received');
        console.log('CurrentScreen: ', currentScreen);
        if(currentScreen != 'player') {
            // Handle sign in

            const isUserSignedInMobile = signInInfo && signInInfo.sinfo && signInInfo.sinfo.is_signed_in;
            // Switch to profile screen first only if user is not signed in on mobile
            if(!isUserSignedInMobile) {

                handleScreenSwitch();
                profileScreen.updateFocus();
            }

            // Then handle sign in
            profileScreen.handleSignIn(signInInfo, statusCallback);
        }
    });

    vzbHomeSSOManager.setSignInInfoGetter(() => {
        // Get sign in info
        return profileScreen.getSignInInfo();
    });

    const homeSSOUIManager = vzbHomeSSOContext.getHomeSSOUIManager();
    homeSSOUIManager.setTheme({
        primaryColor: "#1eabe3",
    });

    // homeSSOUIManager.setSuccessSignInModalConfig({
    //     descriptionTextFontColor: "green"
    // });

    // homeSSOUIManager.setSignInModalConfig({
    //     successPreference: {
    //         options: {
    //             titleText: "Please wait, signing in ...",
    //             titleTextFontFamily: "Arial",
    //             titleTextFontColor: "red",
    //             titleTextFontSize: "50px",
    //         }
    //     }
    // });

    // homeSSOUIManager.setTheme({
    //     theme: {
    //         primaryColor: "#FF0000",
    //     }
    // });

    // homeSSOUIManager.setSignInModalConfig({
    //     modalConfig: {
    //         successPreference: {
    //             titleText: "Please wait, signing in ...",
    //         }
    //     }
    // });
}

function handleScreenSwitch() {
    currentScreen = 'profile';
    sideNav.switchToProfile();
    sideNav.currentFocusedIndex = 1;
    sideNav.setActiveNavItem();
    sideNav.compressSidebar();
    currentFocusedScreen = 'profile';
}

/**
 * Set up the deeplink handler for Vizbee.
 */
function setDeeplinkHandler() {
    if(window.vizbee) {
        const vizbeeHandlersInstance = MyVizbeeHandlers.getInstance(playerScreen);
        const vzbInstance = vizbee.continuity.ContinuityContext.getInstance();
        vzbInstance.getAppAdapter().setDeeplinkHandler((videoInfo) => {
            console.log('Index::setDeeplinkHandler received');
            if (profileScreen && profileScreen.isSignInInProgress) {
                profileScreen.pendingDeeplink = videoInfo;
                return;
            }
            toggleScreen('player');
            currentScreen = "player";
            currentFocusedScreen = "player";
            vizbeeHandlersInstance.deeplinkHandler(videoInfo);
        });
    }
}

function servePendingDeeplink() {
    console.log('Index::servePendingDeeplink');
    if (profileScreen && profileScreen.pendingDeeplink) {
        console.log('Index::servePendingDeeplink - pendingDeeplink found');
        toggleScreen('player');
        currentFocusedScreen = "player";
        const vizbeeHandlersInstance = MyVizbeeHandlers.getInstance(playerScreen);
        vizbeeHandlersInstance.deeplinkHandler(profileScreen.pendingDeeplink);
        profileScreen.pendingDeeplink = null;
    }
}

/**
 * Dynamically add a script to the document.
 * @param {string} src - The source URL of the script.
 * @param {string|null} integrity - The integrity hash for the script (optional).
 * @param {string|null} crossorigin - The crossorigin attribute for the script (optional).
 * @returns {Promise} A promise that resolves when the script is loaded.
 */
function addScript(src, integrity = null, crossorigin = null) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        
        if (integrity) {
            script.integrity = integrity;
        }
        
        if (crossorigin) {
            script.crossOrigin = crossorigin;
        }
        
        script.onload = () => { console.log(`Script load completed`); resolve(script) };
        script.onerror = () => reject(new Error(`Script load error for ${src}`));
        
        document.head.appendChild(script);
    });
}

// [END] Vizbee Integration

window.servePendingDeeplink = servePendingDeeplink;