# Agent Instructions: Study Master Project

This document provides context and instructions for AI agents (and developers) working on the "Study Master" language learning web application.

## Project Architecture

This is a vanilla web application. The core technologies used are:
*   **HTML:** `index.html` (Single Page Application structure with different "screens" like missions, menu, quiz, result).
*   **CSS:** `style.css` (Contains the styling, including theme variables).
*   **JavaScript:** `script.js` (Handles all application logic, state management, progress saving via `localStorage`, audio synthesis, and the confetti canvas animation).

## Data Structure

The application dynamically loads content through JSON files.
*   **`missions.json`**: Located in the root directory. It is a simple JSON array containing relative file paths to the mission definitions.
    *   *Example:* `["missions/spanish-verbs-1.json", "missions/spanish-vocab-1.json"]`
*   **`missions/` directory**: Contains the individual mission files. Each mission is a JSON object defining topics, questions, and achievements.

## Mission JSON Schema

When creating or modifying a mission in the `missions/` directory, use the following schema:

```json
{
  "id": "unique-mission-id",
  "title": "Display Title for the Mission",
  "description": "Short description visible on the mission card",
  "icon": "🥑", // An emoji to represent the mission
  "achievements": [
    // Optional: Custom achievements for this specific mission
    // If omitted, the app will fallback to default achievements defined in script.js
    { "threshold": 0, "icon": "🌱", "title": "Semilla", "translation": "Seed" },
    { "threshold": 3, "icon": "🌿", "title": "Brote", "translation": "Sprout" }
  ],
  "topics": [
    {
      "id": "unique-topic-id",
      "title": "Topic Display Title (e.g., Animals, Colors, 'ser' verb)",
      "questions": [
        { 
          "prompt": "Prompt displayed to the user (e.g., 'Dog' or 'yo')", 
          "answer": "The correct answer to validate against", 
          "type": "free_text" // User must type the answer
        },
        { 
          "prompt": "Prompt displayed to the user", 
          "answer": "The correct answer", 
          "type": "multiple_choice",
          "options": ["correct answer", "wrong 1", "wrong 2", "wrong 3"] // Optional
        }
      ]
    }
  ]
}
```

### Important Notes on Questions:
*   **`type`**: Must be either `"free_text"` or `"multiple_choice"`.
*   **`options` (for `multiple_choice`)**: If you omit the `"options"` array for a multiple-choice question, the application's logic (in `script.js`) will automatically generate distractors by pulling answers from *other questions within the same topic*.

## Instructions for Adding a New Mission

To add a completely new mission to the application, follow these precise steps:

1.  **Create the Mission File**: Create a new `.json` file in the `missions/` directory (e.g., `missions/french-basics.json`).
2.  **Define the Content**: Populate the file following the JSON schema described above. Ensure the `id` is unique. Add at least one topic with multiple questions.
3.  **Register the Mission**: Open `missions.json` in the root directory and append the path of your new file to the array.
    *   *Example:* `[..., "missions/french-basics.json"]`

## Testing Your Changes
The application requires a local web server to function properly because it fetches the JSON files via the `fetch()` API. If you just open `index.html` via the file system (`file://`), CORS policies will block the fetch requests.
Use a tool like `npx serve`, `python -m http.server`, or a Live Server extension in your editor to preview the app.
