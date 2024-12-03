/**
 * SideNav class manages the sidebar navigation functionality.
 */
export default class SideNav {
    constructor() {
        this.sidebar = null;
        this.isExpanded = false;
        this.currentScreen = 'grid';
        this.navItems = null;
        this.currentFocusedIndex = 0;
    }

    init() {
        this.setupElements();
        // this.setupEventListeners();
        this.compressSidebar();
    }

    setupElements() {
        this.sidebar = document.getElementById('sidebar');

        // Update sidebar HTML structure
        this.sidebar.innerHTML = `
            <div class="sidebar-content">
                <div class="sidebar-header">
                    <img src="images/vizbee-logo.png" class="sidebar-logo" alt="Logo">
                    <span class="app-name">Vizbee</span>
                </div>
                <nav class="sidebar-nav">
                    <div class="nav-item active" data-screen="grid">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <span class="nav-text">Home</span>
                    </div>
                    <div class="nav-item" data-screen="profile">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span class="nav-text">Profile</span>
                    </div>
                </nav>
            </div>
        `;

        // After setting up HTML, get reference to nav items
        this.navItems = document.querySelectorAll('.nav-item');
        // Make nav items focusable
        this.navItems.forEach(item => item.setAttribute('tabindex', '0'));
    }

    /**
     * Update focus to the currently selected nav item.
     */
    updateFocus() {
        this.navItems.forEach((item, index) => {
            if (index === this.currentFocusedIndex) {
                item.focus();
            }
        });
    }

    // setupEventListeners() {
    //     const navItems = document.querySelectorAll('.nav-item');
    //     navItems.forEach(item => {
    //         item.addEventListener('click', (e) => this.handleNavigation(e, item, navItems));
    //     });

    //     // Close sidebar when clicking the overlay
    //     this.sidebar.addEventListener('click', (e) => {
    //         if (this.isExpanded && e.target === this.sidebar) {
    //             this.compressSidebar();
    //         }
    //     });
    // }

    /**
     * Handle up arrow key press.
     */
    handleUpArrow() {
        if (this.isExpanded) {
            if(this.currentFocusedIndex === 0) {
                return;
            }
            this.currentFocusedIndex = (this.currentFocusedIndex - 1 + this.navItems.length) % this.navItems.length;
            this.updateFocus();
        }
    }

    /**
     * Handle down arrow key press.
     */
    handleDownArrow() {
        if (this.isExpanded) {
            if(this.currentFocusedIndex === this.navItems.length - 1) {
                return;
            }
            this.currentFocusedIndex = (this.currentFocusedIndex + 1) % this.navItems.length;
            this.updateFocus();
        }
    }

    /**
     * Handle left/right arrows for expand/collapse.
     */
    handleLeftArrow() {
        this.toggleSidebar();
    }

    handleRightArrow() {
        this.toggleSidebar();
        this.updateCurrentFocusedIndex();
    }

    handleEnter() {
        this.setActiveNavItem();
        this.toggleSidebar();
    }

    setActiveNavItem() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((nav, index) => {
            nav.classList.remove('active');
            if (this.currentFocusedIndex === index) {
                nav.classList.add('active');
            }
        });
    }

    handleBack() {
        if (window.tizen) {
            tizen.application.getCurrentApplication().exit();
            window.close();
        }
    }
    
    expandSidebar() {
        this.isExpanded = true;
        this.sidebar.classList.add('expanded');
    }

    compressSidebar() {
        this.isExpanded = false;
        this.sidebar.classList.remove('expanded');
        // Remove focus when collapsing
        document.activeElement.blur();
    }

    toggleSidebar() {
        if (this.isExpanded) {
            this.compressSidebar();
        } else {
            this.expandSidebar();
            // When expanding, focus the current item
            setTimeout(() => this.updateFocus(), 100);
        }
    }

    updateCurrentFocusedIndex() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((nav, index) => {
            if (nav.getAttribute('data-screen') === this.currentScreen) {
                this.currentFocusedIndex = index;
            }
        });
    }

    switchToGrid() {
        const gridScreen = document.getElementById('grid-screen');
        const playerScreen = document.getElementById('player-screen');
        const profileScreen = document.getElementById('profile-screen');

        playerScreen.classList.add('inactive');
        profileScreen.classList.add('inactive');
        gridScreen.classList.remove('inactive');
        gridScreen.classList.add('active');
        this.currentScreen = 'grid';
    }

    switchToProfile() {
        const gridScreen = document.getElementById('grid-screen');
        const playerScreen = document.getElementById('player-screen');
        const profileScreen = document.getElementById('profile-screen');
        
        gridScreen.classList.add('inactive');
        playerScreen.classList.add('inactive');
        profileScreen.classList.remove('inactive');
        profileScreen.classList.add('active');
        this.currentScreen = 'profile';
        profileScreen.focus();
    }
}