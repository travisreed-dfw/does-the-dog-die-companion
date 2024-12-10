import { actions } from './assets/js/shared.js';

document.addEventListener('DOMContentLoaded', () => {
    const radios = document.querySelectorAll('input[name="btnradio"]');

    // Restore the previously selected state
    chrome.storage.local.get(['selectedRadio'], (result) => {
        const selectedRadioId = result.selectedRadio || 'btnradio1'; // Default to "Both"
        const selectedRadio = document.getElementById(selectedRadioId);
        if (selectedRadio) {
            selectedRadio.checked = true;
        }
    });

    // Add event listeners to the radio buttons
    radios.forEach((radio) => {
        radio.addEventListener('change', () => {
            if (!radio.checked) return;

            // Save the selected radio button ID
            chrome.storage.local.set({ selectedRadio: radio.id });

            // Get the action details for the selected radio button
            const { targetClass, toggleClass, action } =
                actions[radio.id] || {};

            // Query the active tab
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const tab = tabs[0];
                if (
                    tab?.url?.startsWith('https://www.doesthedogdie.com/') &&
                    tab.id
                ) {
                    // Execute script only if the URL matches the host permission
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        func: (hideClass, unhideClass, actionType) => {
                            const toggleDisplay = (className, displayValue) => {
                                document
                                    .querySelectorAll(`.${className}`)
                                    .forEach((div) => {
                                        const parentContainer = div.closest(
                                            '.topicRowContainerContainer'
                                        );
                                        if (parentContainer)
                                            parentContainer.style.display =
                                                displayValue;
                                    });
                            };

                            if (actionType === 'hide') {
                                if (hideClass) toggleDisplay(hideClass, 'none');
                                if (unhideClass)
                                    toggleDisplay(unhideClass, 'block');
                            } else if (actionType === 'reset') {
                                toggleDisplay('yes.winner', 'block');
                                toggleDisplay('no.winner', 'block');
                            }
                        },
                        args: [
                            targetClass || '',
                            toggleClass || '',
                            action || 'reset',
                        ],
                    });
                } else {
                    // console.warn(
                    //     'This extension cannot modify the content of this page.'
                    // );
                }
            });
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('movieSearchInput');
    const searchButton = document.getElementById('movieSearchButton');

    searchButton.addEventListener('click', () => {
        const searchQuery = searchInput.value.trim(); // Get the user input and trim whitespace

        if (searchQuery) {
            // Construct the Google "I'm Feeling Lucky" search URL
            const searchUrl = `http://www.google.com/search?q=doesthedogdie+${encodeURIComponent(
                searchQuery
            )}&btnI`;

            // Open a new tab with the constructed URL
            chrome.tabs.create({ url: searchUrl });
        } else {
            alert('Please enter a movie title before searching.');
        }
    });

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });
});
