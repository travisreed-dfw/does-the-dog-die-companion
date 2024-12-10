import { actions, handleDivVisibility, BASE_URL } from './assets/js/shared.js';

// Dynamically create or update the context menu
function createContextMenu(selectedFilter = 'btnradio1') {
    // Remove all existing context menus first
    chrome.contextMenus.removeAll(() => {
        // Create a parent menu
        chrome.contextMenus.create({
            id: 'filterMenu',
            title: 'Filter to only show:',
            contexts: ['all'],
            documentUrlPatterns: [`${BASE_URL}*`], // Use the constant
        });

        // Define menu items
        const menuItems = [
            { id: 'btnradio1', title: '🔵 Both', filter: 'btnradio1' },
            { id: 'btnradio2', title: '🔴 Yes', filter: 'btnradio2' },
            { id: 'btnradio3', title: '🟢 No', filter: 'btnradio3' },
        ];

        // Add submenu items with a checkmark for the selected filter
        menuItems.forEach((item) => {
            chrome.contextMenus.create({
                id: item.id,
                parentId: 'filterMenu',
                title:
                    item.title + (item.filter === selectedFilter ? ' ✔️' : ''),
                contexts: ['all'],
                documentUrlPatterns: [`${BASE_URL}*`], // Use the constant
            });
        });
    });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (tab?.url?.startsWith(BASE_URL)) {
        const selectedRadioId = info.menuItemId;

        if (selectedRadioId) {
            const { targetClass, toggleClass, action } =
                actions[selectedRadioId] || {};

            // Update the storage with the selected filter
            chrome.storage.local.set({ selectedRadio: selectedRadioId }, () => {
                console.log(
                    `Storage updated: selectedRadio = ${selectedRadioId}`
                );

                // Apply the filter to the current tab
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: handleDivVisibility,
                    args: [
                        targetClass || '',
                        toggleClass || '',
                        action || 'reset',
                    ],
                });

                // Recreate the context menu after the action completes
                setTimeout(() => {
                    createContextMenu(selectedRadioId);
                }, 100); // Slight delay to ensure the menu updates after the current operation
            });
        }
    }
});

// Ensure filters are applied on page load or refresh
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url?.startsWith(BASE_URL) && changeInfo.status === 'complete') {
        chrome.storage.local.get(['selectedRadio'], (result) => {
            const selectedRadioId = result.selectedRadio || 'btnradio1';
            const { targetClass, toggleClass, action } =
                actions[selectedRadioId] || {};

            chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: handleDivVisibility,
                args: [targetClass || '', toggleClass || '', action || 'reset'],
            });
        });
    }
});

// Initialize the context menu when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['selectedRadio'], (result) => {
        const selectedFilter = result.selectedRadio || 'btnradio1';
        createContextMenu(selectedFilter);
    });
});

// Listen for storage changes to dynamically update the context menu
chrome.storage.onChanged.addListener((changes) => {
    if (changes.selectedRadio) {
        createContextMenu(changes.selectedRadio.newValue);
    }
});

chrome.omnibox.onInputEntered.addListener((text, disposition) => {
    // Construct the Google search URL for "I'm Feeling Lucky"
    const searchUrl = `http://www.google.com/search?q=doesthedogdie+${encodeURIComponent(
        text
    )}&btnI`;

    // Open the search result in a new tab
    chrome.tabs.create({ url: searchUrl });
});
