# Future Features

This directory contains game features that were removed from the main game flow but preserved for future development.

## Character and Speed Selection

The file `character-speed-selection.js` contains the complete implementation of:

- Character selection screen (Step 1)
- Speed selection screen (Step 2) 
- Instructions screen (Step 3)
- All related setup functions and event handlers

### What was changed in the main game

The original game flow was:
1. Tap to Start → Character Selection → Speed Selection → Instructions → Game Start

The new simplified flow is:
1. Tap to Start → Game Start (immediate)

### How to restore these features

To restore the character and speed selection features:

1. Copy the functions from `character-speed-selection.js` back to `script.js`
2. Uncomment the multi-step welcome flow code in `script.js`
3. Uncomment the `welcomeStep` variable declarations
4. Change the "Tap to Start" button click handler to call `showCharacterSelection()` instead of `startGame()`
5. Restore any removed CSS classes related to character and speed selection

### Default values

With the selection screens removed, the game now uses default values:
- Default character: The first available cat type (likely 'blue')
- Default speed: Whatever value is set in `currentSpeed` variable

These defaults can be adjusted in the main game code if needed.