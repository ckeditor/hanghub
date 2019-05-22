# HangHub

HangHub is a **team productivity tool** that lets you see other users who are working on the same GitHub issue or pull request as you. 

Once HangHub is installed by you and your teammates, it allows you to see whether the users are:

* viewing 👀
* commenting 💬
* editing ✍
* merging 🔀
* idle 💨

You can enable/disable HangHub for a specific organization or a repository of your choice.

<p align="center">
  <img src="https://c.cksource.com/a/2/img/hanghub.gif" alt="Animated presentation of how HangHub works">
</p>

HangHub was created with ❤️ by [CKEditor team](https://ckeditor.com/). We created HangHub out of our own struggles with GitHub, spending time on the same issues without knowing our teammate was also doing the exact same thing. With HangHub we hope to save your and your teammates’ time and help your productivity!

## Usage

After you and your teammates install HangHub, your team will see one another working on the same GitHub issues or pull requests.

**Note: You are only able to see the users who have installed and enabled the extension**, so make sure to share it with your collaborators to make the most out of it!

### Use the official browser extension

HangHub is available as a browser extension in [Chrome web store](https://chrome.google.com/webstore/detail/hanghub/egnoioofamlapfbecfkjgeobkfmfflfo) and [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/hanghub/).

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
