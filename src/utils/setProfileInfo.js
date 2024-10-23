const puppeteer = require('puppeteer');
const path = require('path');

const filePath = path.join(__dirname, '../../public/facebook_ui/index.html');

async function setProfileInfo(profileData) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--start-maximized']
    });
    const [page] = await browser.pages();

    // Set the viewport to the screen dimensions
    const dimensions = await page.evaluate(() => ({
        width: window.screen.width,
        height: window.screen.height
    }));
    await page.setViewport(dimensions);

    await page.goto(filePath, { waitUntil: 'domcontentloaded' });

    try {
        const screenshot = await setData(profileData, page);
        await browser.close(); // Close the browser after operations
        return screenshot; // Return the screenshot buffer
    } catch (error) {
        console.error('Error occurred:', error.message);
        await browser.close(); // Ensure the browser closes on error
        throw error; // Re-throw the error for handling in app.js
    }
}





















async function setData(profileData, page) {
    await page.evaluate(async (profileData) => {
        const { name, profilePicture, backgroundImage, bio, friendsCount, isLocked } = profileData;
        const profilePicElement = document.querySelector('.profilePhotoImage');
        const displayNameElement = document.querySelector('#name');
        const coverPhotoElement = document.querySelector('.coverPhotoImage');
        const statusPicElement = document.querySelector('#statusPic');
        const mainNameElement = document.querySelector('#mainName');
        const bioElement = document.querySelector('#bio');
        const friendsCountElement = document.querySelector('#friendsNumber');
        const friendsTextElement = document.querySelector('#friendsText');
        const isLockedElement = document.querySelector('#isLocked');

        // Utility function to wait for an element to be visible
        async function waitForElementVisibility(element) {
            const isVisible = await element.offsetWidth > 0 && element.offsetHeight > 0; // Basic visibility check
            if (!isVisible) {
                return new Promise((resolve) => {
                    setTimeout(resolve, 3000); // Wait for 3 seconds before resolving
                });
            }
        }



        // Function to set image source and wait for it to load
        const setImageWithLoadCheck = (element, src) => {
            return new Promise((resolve, reject) => {
                if (element) {
                    element.src = src;
                    element.onload = () => resolve();  // Resolve if the image loads
                    element.onerror = () => reject(new Error('Image failed to load')); // Reject if there’s an error
                } else {
                    reject(new Error('Element not found'));
                }
            });
        };

        // Update display name (first 3 words)
        if (name && displayNameElement) {
            displayNameElement.textContent = name.split(' ').slice(0, 3).join(' ');
            await waitForElementVisibility(displayNameElement); // Wait for display name to be visible
        }

        // Update main name
        if (name && mainNameElement) {
            mainNameElement.textContent = name;
            await waitForElementVisibility(mainNameElement); // Wait for main name to be visible
        }

        // Update profile picture with load check
        if (profilePicture) {
            try {
                await setImageWithLoadCheck(profilePicElement, profilePicture);
                await setImageWithLoadCheck(statusPicElement, profilePicture);
            } catch (error) {
                console.error('Profile picture failed to load:', error);
            }
            await waitForElementVisibility(profilePicElement); // Wait for profile picture to be visible
        }

        // Update cover photo with load check
        if (backgroundImage) {
            try {
                await setImageWithLoadCheck(coverPhotoElement, backgroundImage);
            } catch (error) {
                console.error('Cover photo failed to load:', error);
            }
            await waitForElementVisibility(coverPhotoElement); // Wait for cover photo to be visible
        }

        // Update bio
        if (bio && bioElement) {
            bioElement.innerHTML = bio;
            await waitForElementVisibility(bioElement); // Wait for bio to be visible
        } else {
            bioElement.classList.add('hidden');
        }

        // Update friends count
        if (friendsCountElement) {
            if (friendsCount) {
                friendsCountElement.innerText = friendsCount.count;
                await waitForElementVisibility(friendsCountElement); // Wait for friends count to be visible
            } else {
                friendsCountElement.classList.add('hidden');
                if (friendsTextElement) {
                    friendsTextElement.classList.add('hidden');
                }
            }
        }


        // Update bio
        if (isLocked && isLockedElement) {
            isLockedElement.classList.remove('hidden');
            await waitForElementVisibility(isLockedElement); // Wait for bio to be visible
        } else if (isLockedElement) {
            isLockedElement.classList.add('hidden');
        }




    }, profileData);

    console.log("Profile information has been set successfully!");

    // Take a screenshot after attempting to ensure all elements are visible
    const screenshotBuffer = await takeScreenshot(page);
    return screenshotBuffer; // Return the screenshot buffer
}


































async function takeScreenshot(page) {
    try {
        // new Promise(resolve => setTimeout(resolve, 2000));
        const element = await page.$('.rootBody');
        const screenshotBuffer = await element.screenshot();
        return screenshotBuffer;

    } catch (error) {
        console.error('Error taking screenshot:', error);
        throw error; // Re-throw error for higher-level handling
    }
}

// Export the function
module.exports = { setProfileInfo };

