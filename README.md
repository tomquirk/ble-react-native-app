Learnings:

- need to explicitly request permission for a bunch of things (bluetooth, location etc). Can't just add them to the manifest
- apparently, may need to delay scanning until a few seconds after launch?
- plug the phone in to laptop, way easier/more stable
- bleManager needs to be instantiated once, ever. Dont put it in a component or hook
- `expo start` and `expo run:android` are somehow different?
- `eas build` lets you run the build on Expo's hosted service, then you get a link. It's slower though.
- Emulators don't work. Need a real device.
- You actually do need the `npx` to start commands. Otherwise there's weird version conflicts (somehow?)
- Java/JDK 17 only
- get the expo app on device
- Need android dev studio
- Need to add `ANDROID_HOME` to $PATH

Random commands I've run:

- `eas build:configure`
- `eas build --profile development --platform android`
- `npx expo start --dev-client`
- `npx expo run:android`
- `npx expo prebuild`
- `adb uninstall "com.domain.my-app"` - uninstalls the app, if you actually installed it
