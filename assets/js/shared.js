// icon color #ffed53
// background-color #373946
// 🔵 Both
// 🔴 Yes
// 🟢 No

export const BASE_URL = 'https://www.doesthedogdie.com/';

export const actions = {
    btnradio1: { action: 'reset' }, // Show Both
    btnradio2: {
        targetClass: 'no.winner',
        toggleClass: 'yes.winner',
        action: 'hide',
    }, // Show Yes
    btnradio3: {
        targetClass: 'yes.winner',
        toggleClass: 'no.winner',
        action: 'hide',
    }, // Show No
};

// Optional: export other shared utilities or constants if needed
export function handleDivVisibility(hideClass, unhideClass, actionType) {
    const toggleDisplay = (className, displayValue) => {
        document.querySelectorAll(`.${className}`).forEach((div) => {
            const parentContainer = div.closest('.topicRowContainerContainer');
            if (parentContainer) parentContainer.style.display = displayValue;
        });
    };

    if (actionType === 'hide') {
        if (hideClass) toggleDisplay(hideClass, 'none');
        if (unhideClass) toggleDisplay(unhideClass, 'block');
    } else if (actionType === 'reset') {
        toggleDisplay('yes.winner', 'block');
        toggleDisplay('no.winner', 'block');
    }
}
