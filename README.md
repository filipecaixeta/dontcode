# DontCode
An alternative to dontpad. 
![screenshot](https://raw.githubusercontent.com/filipecaixeta/dontcode/master/dontcode.png)

## Features
- Syntax highlighting for the major languages
- Synchronization with web sockets
- Folder structure support
- API for content download and upload

## Install and Run
### With Docker
Edit the docker-compose.yml to use the port of your choice. Default is 80

Then run
```
docker-compose up --build
```
### Without Docker
Edit backend/src/main.ts and set the static folder to frontend/dist

Edit backend/src/main.ts and set the host and port of your redis

Then run
```
cd frontend
yarn install
yarn run build
cd ..
cd backend
yarn install
yarn run prod
```

## Usage
You can have any folder structure you want

There is no distinction of what is a folder and what is a file

Use like this

www.your-dontcode-url.com/folder/subfolder

www.your-dontcode-url.com/anything

## API
If you want to get a plain text you can pass a query string text
if you pass header 'accept: application/json' you get a json response, otherwise you get a plain text
```
curl -X GET \
  www.your-dontcode-url.com/anything?text \
  -H 'accept: application/json'
```
You can get the files tree by passing the query files
if you pass header 'accept: application/json' you get a json response, otherwise you get a plain text
```
curl -X GET \
  www.your-dontcode-url.com/anything?files \
  -H 'accept: application/json'
```

You can set the text by a post request
```
curl -X POST \
  www.your-dontcode-url.com/anything \
  -H 'Content-Type: application/json' \
  -H 'accept: application/json' \
  -d '{
  "text": "your text here",
  "mode": "optional field with the language for syntax highlighting"
}'
```

## Problems?
If you found a bug plese submit [here](https://github.com/filipecaixeta/dontcode/issues) or send me an email.
