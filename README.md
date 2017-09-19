# MoJoFy
This is the platform who shows the video backups form Vimojo

> BE CAREFULL!! This project is changing so much from one day to the next, so everything you think you know might be false. 
> OLD DOCS!! Yap, first commit, old docs. Software sucks. This is not old, but ONLY related with the frontend part. I know, this is backend, I know. I'm on it.

Hello, Advent... Developer!

Well, you might not be afraid of this repo, even if somebody told you there have React written by a newbie, or that webpack and gulp lives together, or... well, I'd better stop. This esay step by step will guide you in the funny world of getting your work directory ready to rock! Or to develop this.

## Setup the enviroment

First at all, you must have installed `node` and `npm`. You can verify it writting in your console `node -v` and `npm -v`. If you have a beautiful response, there are. If not... well, install it.

Once you have it installed, install gulp-cli and webpack globally. Probably you'll use it in more projects, so don't you worry, global is not bad. Here. Do that with `npm install -g gulp-cli webpack`. 

Now, we've got all the tools. Let's install the dependencies with `npm install`. 

Done? Great! You've got it.


## Folder architecture

Basically, we have two main folders: `client` and `public`. The first one, have all the source code. The seccond one is generated from the first. To do that, we have two tools: Webpack and Gulp. 

Webpack, basically, takes all the js and put it in one file, resolving all the browser stuff, converting ES6 Syntax into ES5 recognizable for all the browsers. Gulp do something similar with CSS. 

To build, you have to execute:
```
webpack
```
and:
```
gulp styles
```

You can do it in one only line with (on windows):
```
webpack && gulp styles
```
or (on linux):
```
webpack; gulp styles
```

### Client Folder:

This have an `index.js`, `app.js`, `index.html`, `index.css` and a folder called `components`. The components folder also have more folders, with all the components. Index.js is the entry point of React App. It creates a basic App component and inject it into the index.html. App.js is the root of the app, and contains the routing. Index.html is the basic structure of html app, and index.css the common styles for all the app.

#### Components
About components, we have two type of components: Statefull and stateless. Stateless is just "visual stuff", and don't have any state. Statefull are "interactive stuff" who need to have state. 

I will go in depth when I have deeper knoweledge about all this stuff. For the moment, "Card" or "Player" are stateless and "VideoList" and "VideoDetail" are statefull. That's all I know.

# Improve this documentation

I don't really know what stuff do you need to know, but if you have some doubts, and you search or ask something, add it here, so next person (or some of us in the future) will have here that doubt resolved. Thx!
