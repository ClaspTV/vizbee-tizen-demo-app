import { HttpClient } from '../utils/http-client';

/**
 * ProfileScreen class manages the profile view and handles user authentication state.
 */
export default class ProfileScreen {
    /**
     * Initialize the ProfileScreen instance.
     */
    constructor() {
        this.isSignedIn = false;
        this.userEmail = null;
        this.userAuthToken = null;

        this.container = null;
        this.currentFocusedElement = null;
        this.focusableElements = [];

        this.signInInfo = null;
        this.isMobileUserSignedIn = false;

        this.isVideoPlayerActive = false;

        this.deviceInfo = null;

        this.api = new HttpClient('https://homesso.vizbee.tv');

        this.isSignInInProgress = false;
        this.regCode = null;

        this.isPolling = false;
        this.shouldContinue = true;
        this.pollingInterval = null;
    }

    /**
     * Initialize the profile screen by checking authentication state and setting up the UI.
     */
    init() {
        try {
            this.deviceId = webapis && webapis.productinfo && webapis.productinfo.getDuid();
        } catch (error) {
            console.error('Failed to load webapis:', error);
        }
        this.checkAuthState();
        this.setupOrUpdateUI();
    }

    /**
     * Check the current authentication state.
     */
    checkAuthState() {
        // if user NOT signed in, 
        //      set isSignedIn to false
        //      set userEmail to null
        // if user signed in
        //      set isSignedIn to true
        //      set userEmail from localStorage
        if (localStorage.getItem('userEmail') && localStorage.getItem('userAuthToken')) {
            this.isSignedIn = true;
            this.userEmail = localStorage.getItem('userEmail');
            this.userAuthToken = localStorage.getItem('userAuthToken');
        } else {
            this.clearUserInfo();
        }
    }

    /**
     * Set up the user interface elements.
     */
    setupOrUpdateUI() {
        const profileHTML = `
            <div class="profile-screen-content">
                <div class="profile-container">
                    ${this.getProfileContent()}
                </div>
            </div>
        `;

        if (!document.getElementById('profile-screen')) {
            const container = document.createElement('div');
            container.id = 'profile-screen';
            document.body.appendChild(container);
        }

        this.container = document.getElementById('profile-screen');
        this.container.innerHTML = profileHTML;
    }

    updateFocus() {
        if (this.isSignedIn) {
            // Add click handler for signout button
            const signoutBtn = this.container.querySelector('#signout-btn');
            if (signoutBtn) {
                signoutBtn.focus();
            }
        } else {
            // Add click handler for signout button
            const notSignedInSection = this.container.querySelector('.not-signed-in');
            if (notSignedInSection) {
                notSignedInSection.focus();
            }
        }
    }

    /**
     * Get the appropriate content for the profile view based on auth state.
     * @returns {string} HTML content for the profile view
     */
    getProfileContent() {
        if (this.isSignInInProgress && !this.isMobileUserSignedIn) {
            if(!this.regCode) {
                return `
                    <div class="profile-card">
                        <div class="profile-content">
                            <div class="profile-section signing-in">
                                <p class="signin-instruction">Generating Regcode ...</p>
                            </div>
                        </div>
                    </div>
                `;
            }
            else {
                return `
                    <div class="profile-card">
                        <div class="profile-content">
                            <div class="profile-section signing-in">
                                <h2>Log into your cable provider.</h2>
                                <p class="signin-instruction">Please go to xyz.com on your computer or mobile and enter the code below</p>
                                <h1>${this.regCode}</h1>
                            </div>
                        </div>
                    </div>
                `;
            }
        } else if (this.isSignedIn) {
            return `
                <div class="profile-card">
                    <div class="profile-content">
                        <div class="profile-section">
                            <div class="profile-avatar">
                                <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                                </svg>
                            </div>
                            <div class="profile-info">
                                <h2>Signed in as</h2>
                                <p class="user-email">${this.userEmail}</p>
                                <button id="signout-btn" class="profile-btn" tabindex="0">
                                    <span class="btn-text">Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="profile-card">
                    <div class="profile-content">
                        <div class="profile-section not-signed-in">
                            <h2>You are currently not signed in</h2>
                            <p class="signin-instruction">Please use mobile app to sign in to the account.</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Update the list of focusable elements.
     */
    updateFocusableElements() {
        this.focusableElements = Array.from(
            this.container.querySelectorAll('button, [tabindex="0"]')
        );
    }

    /**
     * Set initial focus on the first focusable element.
     */
    setInitialFocus() {
        if (this.focusableElements.length > 0) {
            this.currentFocusedElement = this.focusableElements[0];
            this.currentFocusedElement.focus();
        }

        this.updateFocus();
    }

    /**
     * Handle user signout.
     */
    async handleSignout() {
        // Clear auth state
        
        try {
            const signoutResponse = await this.api.post('/v1/signout', 
                {}, 
                {
                    headers: {
                        'Authorization': this.userAuthToken
                    },
                    timeout: 5000,
                    retries: 20
                }
            );
            this.clearUserInfo();

            // Update UI
            this.setupOrUpdateUI();
        } catch (error) {
            console.error('handleSignout::Failed to sign out user:', error);

            // Update UI
            this.setupOrUpdateUI();
        }
    }

    /**
     * Handle enter key press.
     */
    handleEnter() {
        if (this.isSignedIn && document.activeElement.id === 'signout-btn') {
            this.handleSignout();
        }
    }

    /**
     * Handle back button press.
     * @returns {boolean} True if the back press was handled
     */
    handleBack() {
        // Let the main app handle the back press to return to previous screen
        return false;
    }

    // SignIn handling methods

    getSignInInfo() {
        const UNKNOWN = 'unknown';
        if(!this.isSignedIn) {
            return Promise.resolve([{
                userLoginType: "MVPD",
                isSignedIn: false
            }]);
        }

        return Promise.resolve([{
            userLoginType: "MVPD",
            isSignedIn: true,
            userLogin: this.userEmail,
            userName: this.userEmail,
            userSubscriptionRenewalType: "monthly",
            userSubscriptionType: "subscriptionType-1",
            userSubscriptionValue: "subscriptionValue-1",
            userAdditionalInfo: {
                customKey1: "customValue1",
                customKey2: "customValue2"
            },
        }]);
    }

    /**
     * Handle user sign in
     * @param {Object} signInInfo - Sign in information
     * @param {Function} statusCallback - Callback to handle status updates
     */
    async handleSignIn(signInInfo, statusCallback) {
        console.log('Handling sign in:', signInInfo);

        this.statusCallback = statusCallback;

        if(this.isSignedIn) {
            console.log('User is already signed in');
            return;
        }

        this.signInInfo = signInInfo && signInInfo.sinfo;
        if(!this.signInInfo) {
            console.error('Invalid sign in info');
            return;
        }

        this.isSignInInProgress = true;
        this.isMobileUserSignedIn = this.signInInfo.is_signed_in;
        if(!this.isMobileUserSignedIn) {
            this.setupOrUpdateUI();
        }

        console.info('User is NOT signed in');
        try {
            const regCodeResponse = await this.api.post('/v1/accountregcode', 
                { 
                    "deviceId": this.deviceId 
                }, 
                {
                    timeout: 5000,
                    retries: 10
                }
            );
            if (regCodeResponse.data && regCodeResponse.data.code) {
                const regCode = regCodeResponse.data.code;
                this.regCode = regCode;
                this.setupOrUpdateUI();
                
                // Notify progress with registration code
                const progressSignInStatus = new vizbeehomesso.messages.ProgressStatus(this.signInInfo.stype, { regcode: regCode });
                statusCallback(progressSignInStatus);

                // Start polling for sign-in status
                this.startPolling(regCode, statusCallback);
            }
        } catch (error) {
            console.error('Failed to get registration code:', error);

            const errorSignInStatus = new vizbeehomesso.messages.FailureStatus(this.signInInfo.stype, 'Failed to get registration code', false, error);
            statusCallback(errorSignInStatus);
            console.error('Calling servePendingDeeplink');
            window.servePendingDeeplink();
        }
    }

    /**
     * Poll the server for sign-in status
     * @param {string} regCode - Registration code to poll
     * @param {Function} statusCallback - Callback to handle status updates
     * @returns {Promise<void>}
     */
    async pollSignInStatus(regCode, statusCallback) {
        try {
            if(this.isSignedIn) {
                return true;
            }

            const pollingResponse = await this.api.post('/v1/accountregcode/poll', 
                { 
                    "deviceId": this.deviceId, 
                    "regCode": regCode 
                }, 
                {
                    timeout: 5000,
                    retries: 10
                }
            );

            console.log('PollSignInStatus: Polling response:', pollingResponse);
            if (pollingResponse.data && pollingResponse.data.status === "done") {

                console.log('Sign in successful:', pollingResponse.data);
                
                // Clear the polling interval
                if (this.pollingInterval) {
                    clearInterval(this.pollingInterval);
                    this.pollingInterval = null;
                }
                
                // Update sign-in state
                this.isSignedIn = true;
                console.log('Sign in successful:', this.isSignedIn);
                this.userEmail = pollingResponse.data.email;
                this.userAuthToken = pollingResponse.data.authToken;
                this.signInType = this.signInInfo && this.signInInfo.stype;
                localStorage.setItem('userEmail', this.userEmail);
                localStorage.setItem('userAuthToken', this.userAuthToken);

                // Notify success
                const successSignInStatus = new vizbeehomesso.messages.SuccessStatus(this.signInInfo.stype, this.userEmail, { email: this.userEmail } );
                statusCallback(successSignInStatus);

                this.isSignInInProgress = false;
                this.regCode = null;
                return true;
            }
            console.log('PollSignInStatus: Sign in not done yet:', pollingResponse.data);
            return false;
        } catch (error) {
            console.error('PollSignInStatus: Polling failed:', error);
            this.isSignInInProgress = false;
            this.regCode = null;
            return false;
        }
    }

    /**
     * Start polling with interval
     * @param {string} regCode - Registration code to poll
     * @param {Function} statusCallback - Callback to handle status updates
     * @param {number} maxAttempts - Maximum number of polling attempts (optional)
     */
    async startPolling(regCode, statusCallback, maxAttempts = 9999) {
        let attempts = 0;
        this.shouldContinue = true;

        while (this.shouldContinue && attempts < maxAttempts) {
            if (!this.isPolling) {
                this.isPolling = true;
                console.log('Polling attempt:', attempts);
                attempts++;

                try {
                    const success = await this.pollSignInStatus(regCode, statusCallback);
                    
                    if (success) {
                        this.shouldContinue = false;
                        this.setupOrUpdateUI();
                        this.updateFocus();
                        console.log('Sign in successful, calling servePendingDeeplink');
                        window.servePendingDeeplink();
                    }
                } catch (error) {
                    console.error('Polling error:', error);
                } finally {
                    this.isPolling = false;
                }
            }

            // Wait for the polling interval before next attempt
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Handle max attempts reached
        if (attempts >= maxAttempts) {
            const errorSignInStatus = new vizbeehomesso.messages.FailureStatus(
                this.signInInfo.stype, 
                'Sign in timeout', 
                false
            );
            statusCallback(errorSignInStatus);
            console.error('Sign in timeout, calling servePendingDeeplink');
            window.servePendingDeeplink();
        }
    }

    cancelSignIn() {
        clearInterval(this.pollingInterval);

        this.isSignInInProgress = false;
        this.regCode = null;
        this.setupOrUpdateUI();

        const errorSignInStatus = new vizbeehomesso.messages.FailureStatus(this.signInInfo.stype, 'User cancelled the signin', true);
        this.statusCallback(errorSignInStatus);
        window.servePendingDeeplink();
    }

    clearUserInfo() {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userAuthToken');
        this.isSignedIn = false;
        this.userEmail = null;
        this.userAuthToken = null;
    }
}