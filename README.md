# 🍦 icecream

> A sleek, developer-focused JavaScript and Python compiler with a built-in whiteboard.

![App Icon](./assets/app-icon.png)

## ✨ Features

- **🚀 Multilingual Support**: Write and run JavaScript and Python code seamlessly.
- **🎨 Built-in Whiteboard**: Sketch out algorithms or design ideas directly within the app.
- **🔍 Scoped Zoom**: Intelligent zooming that stays within the editor and console, keeping the UI fixed.
- **💎 Premium Aesthetics**: Beautifully themed with Dracula, Monokai, and more. Featuring **JetBrains Mono** font across the board.
- **📂 File Explorer**: Manage your project files with a clean, responsive sidebar.
- **🌗 Multiple Themes**: Choose from Dracula, Monokai, Material, Nord, or a clean Light theme.
- **⌨️ Keyboard First**: Full support for shortcuts like `Cmd+Enter` to run and `Cmd+S` to save.

## 🛠️ Built With

- **[Electron](https://www.electronjs.org/)**: For a powerful desktop experience.
- **[CodeMirror](https://codemirror.net/)**: Providing a high-performance code editor.
- **Vanilla CSS & JS**: Leveraging modern web standards for speed and flexibility.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AbnormalPilot/icecream.git
   cd icecream
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the app**
   ```bash
   npm start
   ```

### 📦 Building for Production

To generate a production-ready package for macOS, Windows, or Linux:

```bash
npm run dist
```

## ⌨️ Shortcuts

| Action | Shortcut |
| :--- | :--- |
| **Run Code** | `Cmd + Enter` |
| **Save File** | `Cmd + S` |
| **Zoom In** | `Cmd +` |
| **Zoom Out** | `Cmd -` |
| **Reset Zoom** | `Cmd 0` |

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚠️ Troubleshooting (macOS)

Since the app is not signed with an Apple Developer certificate, macOS might show a message saying **"Icecream is damaged and can't be opened"** or block it via Gatekeeper.

### Fix 1: The "Open Anyway" Method
1. Open **System Settings** > **Privacy & Security**.
2. Scroll down to the **Security** section.
3. You should see a message about "Icecream" being blocked. Click **Open Anyway**.
4. Enter your password and click **Open**.

### Fix 1: Right-Click "Open" (Highly Recommended)
1. Locate **Icecream.app** in your Applications or Downloads folder.
2. **Right-click** (or Control-click) the app icon.
3. Select **Open** from the menu.
4. A dialog will appear saying it can't be verified. Click **Open** again.
   *(This "Right-Click" trick skips the initial Gatekeeper block.)*

### Fix 2: System Settings
1. If the app still doesn't open, go to **System Settings** > **Privacy & Security**.
2. Scroll down to the **Security** section.
3. Look for a message saying "Icecream was blocked..." and click **Open Anyway**.
4. Enter your password and confirm.

## ❤️ Credits

Made with ❤️ by [Himanshu](https://github.com/AbnormalPilot).
