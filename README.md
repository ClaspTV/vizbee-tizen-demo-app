# Vizbee Samsung Tizen TV Demo App

Vizbee Samsung Tizen TV Demo App demonstrates how to integrate Vizbee casting 
functionality into an Samsung Tizen TV app.

## Integration Steps for your Samsung Tizen TV app

Look for the block comments with text "[BEGIN] Vizbee Integration" and 
"[END] Vizbee Integration" in the code for an easy understanding of the integration.

### Setup

#### Prerequisites
- Ensure you have minimum Node.js version of 16.15.1 installed on your system.
- Setup Tizen studio to run the app on your Tizen TV.

For how to install & setup Tizen studio, refer to [Setup Tizen Studio](#tizen-studio-setup).

#### Installation

- Clone this repository: `git clone https://github.com/ClaspTV/vizbee-tizen-demo-app.git`.
- Install the dependencies: `npm install`.

### Running the app

This project uses Webpack for bundling and Babel for transpiling. The main entry point is `js/index.js`.
1. Build the project: `npm run build`.

#### Use build directory

1. Import the `build` directory as a Tizen project in Tizen studio and sidelad the app.

#### Use .wgt file

1. Generate the .wgt file for Tizen TV deployment: `npm run package`.
2. Import the widget file as a Tizen project in the Tizen studio and sideload the app.

### Packaging

To package the app for Tizen TV:

1. Run `npm run build` to create a production build.
2. Run `npm run package` to generate the .wgt file.

### Configuration

- Replace the Demo Vizbee App ID with your actual App ID: `vzbInstance.start('vzb2000001');` in `js/index.js`.
- Replace the bitmovin player key with your's: `<YOUR-BITMOVIN-PLAYER-KEY>` in `setupPlayer` method of  `js/screens/PlayerScreen.js`.
- Replace the app's package name with your's: `<YOUR-APP's-PACKAGE-NAME-CONFIGURED-WITH-BITMOVIN-PLAYER>` in `setupPlayer` method of  `js/screens/PlayerScreen.js`.

## Project Structure

```
.
├── .vscode/
├── build/
├── css/
├── fonts/
├── images/
├── js/
├── packages/
├── index.html
├── appinfo.json
├── README.md
├── .babelrc
├── package.json
├── generate-package.sh
└── webpack.config.js
```

| File/Folder         | Description                                                                           |
| ------------------- | ------------------------------------------------------------------------------------- |
| index.html          | HTML laying out the structure of the demo and definition of the used player resources |
| js/index.js         | Main JavaScript file our demo application will use                                    |
| js/screens          | App UI screens                                                                        |
| js/vizbee           | Vizbee integration code                                                               |
| images/             | The application logo assets                                                           |
| fonts/              | Font files used in the demo application                                               |
| css/                | Stylesheets used for making the demo application pretty                               |
| config.xml          | Contains configuration options, application privileges and entry points               |
| generate-package.sh | Shell script that generates app package                                               |
| build/              | Code distribution files generated after build command                                 |
| packages            | Package file (.wgt) generated after package command                                   |

## Dependencies

This project uses several development dependencies, including:

- Babel for JavaScript transpilation
- Webpack for bundling
- Various loaders and plugins for asset management

For a full list of dependencies, please refer to the `package.json` file.

## Troubleshooting

If you encounter any issues:

1. Ensure all prerequisites are installed and up to date.
2. Clean the build folder `npm run clean`.

## Support

For any questions or support, please contact support@vizbee.tv or visit our documentation at https://developer.vizbee.tv/continuity/smart-tv/integration-guide/setup

## Appendix

### Tizen studio setup

1. Download [Tizen Studio](https://developer.tizen.org/development/tizen-studio/download)
3. Connect to your TV. This [tutorial](https://developer.samsung.com/tv/develop/getting-started/using-sdk/tv-device) is a good reference
5. Run/debug the sample app. If you debug, you will see Chrome developer tools launch. This will enable you to debug, monitor network requests, and execute commands through the javascript console.

### Documentation
- [Vizbee Smart TV Developer Guide](https://developer.vizbee.tv/continuity/smart-tv/integration-guide/setup)
- [Vizbee Documentation](https://developer.vizbee.tv)