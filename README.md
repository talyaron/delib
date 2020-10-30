# Delib - Making decisions together

**Delib is a deliberation PWA**

Version-3 is built using [Mithril JS](https://mithril.js.org/) and [Firebase](https://firebase.google.com/). For more information go to [delib.org](http://delib.org)

## Installing

Clone this repository.

Delib is built using Mitheil-JS and firebase. To use firebase please install firebase CLI:
In the terminal write

`npm i -g firebase-tools`

Create a project at fireabse: https://console.firebase.google.com/

in the source directory of delib add a file "configKey.js"

To get your project's setting, go to the project settings->general, go to the section called 'Your apps' -> 'Firebase SDK snippet', and change to 'CDN'. there you can see 'firebaseConfig' add it the the file configKey.js file

```
 const configKey = {
     the configuration you got from firebase in the setting of your project
  };

  module.exports = configKey;
  ```

## installing depndancins 
At the root directory run `npm i`.
At the "functions" directory run `npm i`

## Login to firbase 
`firebase login`
## running
In the root directory run `npm run dev` and in another terminal run `firebase serve`.
you will be able to see the app running on localhost:5000

##Deploy to dev site

`firebase use delib-v3-dev` (only at the first time).

deploy: `firebase deploy`
