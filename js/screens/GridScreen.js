/**
 * GridScreen class manages the grid view of media items and handles user navigation.
 */
export default class GridScreen {
    /**
     * Initialize the GridScreen instance.
     */
    constructor(mediaList) {
        this.mediaList = mediaList; // Videos list to be shown in the grid
        this.cards = null;  // Will hold references to all card elements
        this.currentFocusedItemIndex = 0;  // Keeps track of the currently focused card
    }

    /**
     * Initialize the grid screen by loading the media list and setting up the UI.
     */
    init() {
        this.setupUI(this.mediaList);
    }

    //-------------
    // UI methods
    //-------------

    /**
     * Set up the user interface by creating cards for each media item.
     * @param {Array} mediaList - List of media items to display in the grid.
     */
    setupUI(mediaList) {
        mediaList.forEach(media => {
            this.insertCard(media.imageUrl, media.title);
        });
        this.cards = document.querySelectorAll('.card');
        this.updateFocus();
    }

    /**
     * Insert a card into the grid container.
     * @param {string} imageUrl - URL of the image to display on the card.
     * @param {string} title - Title of the media item.
     * @param {string} [containerId='grid-container'] - ID of the container to insert the card into.
     */
    insertCard(imageUrl, title, containerId = 'grid-container') {
        const cardHTML = `
            <div class="card" tabindex="0">
                <img src="${imageUrl}" alt="${title}">
                <div class="card-title">
                    <span>${title}</span>
                </div>
            </div>
        `;

        const container = document.getElementById(containerId);

        if (container) {
            container.insertAdjacentHTML('beforeend', cardHTML);
        } else {
            console.error(`Container with id "${containerId}" not found`);
        }
    }

    /**
     * Update the focus to the currently selected card.
     */
    updateFocus() {
        this.cards[this.currentFocusedItemIndex].focus();
    }

    //-----------------
    // Remote key handling methods
    //-----------------
    
    /**
     * Handle left arrow key press.
     * Moves the focus to the previous card in the grid.
     */
    handleLeftArrow() {
        if(this.currentFocusedItemIndex === 0) {
            return;
        }
        this.currentFocusedItemIndex = (this.currentFocusedItemIndex - 1 + this.cards.length) % this.cards.length;
        this.updateFocus();
    }

    /**
     * Handle right arrow key press.
     * Moves the focus to the next card in the grid.
     */
    handleRightArrow() {
        if(this.currentFocusedItemIndex === this.cards.length - 1) {
            return;
        }
        this.currentFocusedItemIndex = (this.currentFocusedItemIndex + 1) % this.cards.length;
        this.updateFocus();
    }

    /**
     * Get the index of the currently focused item.
     * @returns {number} The index of the currently focused item.
     */
    getCurrentItemIndex() {
        return this.currentFocusedItemIndex;
    }

    /**
     * Handle back button press.
     * Exits the application on Tizen devices.
     */
    handleBack() {
        if (window.tizen) {
            tizen.application.getCurrentApplication().exit();
            window.close();
        }
    }
}