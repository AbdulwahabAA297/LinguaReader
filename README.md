# LinguaReader

LinguaReader is a desktop application for interactive reading and vocabulary building with spaced repetition. This application is designed to run on your personal computer with all data stored locally.

## Features

- Import books in multiple formats (EPUB, PDF, TXT)
- Interactive reading interface with word lookup
- Vocabulary management system
- Spaced repetition for effective learning
- Works completely offline
- User data stays on your computer

## Installation

### Download Pre-built Application

1. Download the appropriate version for your operating system:
   - Windows: `LinguaReader-win.exe`
   - macOS: `LinguaReader-mac.dmg`
   - Linux: `LinguaReader-linux.AppImage`

2. Run the installer and follow the on-screen instructions.

3. Launch LinguaReader from your applications menu.

### Build from Source

If you prefer to build the application yourself:

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/linguareader.git
   cd linguareader
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the application for your platform:
   ```
   # For Windows
   npm run electron:package:windows
   
   # For macOS
   npm run electron:package:mac
   
   # For Linux
   npm run electron:package:linux
   ```

4. The packaged application will be available in the `release` folder.

## Usage

### Adding Books

1. Click the "Import Book" button in the Library section.
2. Select a book file (EPUB, PDF, or TXT) from your computer.
3. Choose the language of the book.
4. Click "Import" to add the book to your library.

### Reading and Learning

1. Open a book from your library.
2. Click on any word to look up its meaning.
3. Add words to your vocabulary list with the "+" button.
4. Use the flashcard system to review vocabulary with spaced repetition.

### Data Management

- All your data is stored locally on your computer.
- Use the Settings panel to export/backup your data.
- Your books, vocabulary, and progress are never sent to any server.

## Customization

LinguaReader offers several customization options:

- Change the font size and display mode in reading view
- Switch between light, dark, and sepia themes
- Set preferred dictionary sources
- Adjust spaced repetition algorithm parameters

## License

MIT

## Privacy

LinguaReader is designed with privacy in mind:
- No data is sent to external servers
- All your books, vocabulary, and progress stay on your computer
- No tracking or analytics

## Support

For issues, suggestions, or contributions:
- File an issue on GitHub
- Contact: support@linguareader.app