# HangHub

HangHub is a productivity tool that allows you to see users who are working on the same GitHub issue as you. It gives information in real time about whether they are: 

* viewing 👀
* commenting ✍
* merging 🔀
* idle 💨

You can activate HangHub for a specific organization or a repository of your choice.

<p align="center">
  <img src="https://c.cksource.com/a/1/img/hanghub.gif" alt="Animated presentation of how HangHub works">
</p>

HangHub was created with ❤️ by [CKEditor team](https://ckeditor.com/). We created HangHub out of our own struggles with GitHub, spending time on the same issues without knowing our teammate was also doing the exact same thing. With HangHub we hope to save your and your teammates’ time and help your productivity!

## Usage

### Use the official browser extension

HangHub is available as a browser extension in Chrome web store and Firefox Add-ons.

### Build your own version

You are most welcome to modify the plugin and build your custom version. We will be happy to see pull requests with plugin enhancements, too!

#### 1. Clone

```
git clone https://github.com/ckeditor/hanghub.git
```

#### 2. Install and build

```
cd hanghub/frontend
npm i
npm run build
```

#### 3. Add the plugin to Google Chrome

* Navigate to `chrome://extensions`.
* Switch on "Developer mode".
* Click "Load unpacked".
* Navigate to the the `hanghub/frontend/build` directory containing the extension code and submit.

#### 4. Add the plugin to Mozilla Firefox

* Navigate to `about:debugging`.
* Click "Load Temporary Add-on...".
* Navigate to the `hanghub/frontend/build` directory and open the `manifest.json` file.

### Use your own server

HangHub backend is free to use. But if you feel better with your own backend server, you can also use it. Assuming that you have already cloned the HangHub project, you need to proceed as follows.

#### 1. Install and build

```
cd hanghub/backend
npm i
```

#### 2. Deploy

Deploy the content of the `backend` directory to your server.

#### 3. Change the `SOCKET_URL`

You now need to replace the `SOCKET_URL` in `frontend/src/index.js` and add it to the `frontend/manifest.json` file in the `permissions` array. After that, rebuild the frontend part of the project using `npm run build`.

## License

Licensed under the terms of the [MIT](http://en.wikipedia.org/wiki/MIT_License) license. For full details about the license, please check the `LICENSE.md` file.
