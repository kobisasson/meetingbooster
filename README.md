# README #

### What is this repository for? ###

Installation
------------
This CLI enable to create meeting request on the fly.


### How do I get set up? ###


Installation
------------

To use with node:

```bash
$ npm install -g meetingbooster
```
* Configuration

Configuration
------------
In order to excute meetingbooster, create a new folder with the following files:
config.json, e.g.:
```javascript
{
  "start": "2016-02-01T09:00:00+02:00",
  "end": "2016-02-01T09:30:00+02:00",
  "location": "@Office",
  "categories": "Green",
  "reminder": "-PT15M",
  "organizer": {
    "name": "Perry",
    "email": "dolor@dolorsitamet.ca"
  },
  "uid": "c1f4f1e6-dbc9-4c17-aa09-8a2ab9864da3",
  "timestamp": "2016-02-01T09:00:00+02:00"
}
```
users.csv, e.g.:
```csv
id,firstName,lastName,email,comments
1,Boris,Guzman,pellentesque.a.facilisis@vitaedolorDonec.org,None
```
template.content.txt, e.g.( can also except html content):
```txt
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{firstName}}</title>
</head>
<body style="font-family:Calibri,sans-serif;" >
Hi {{firstName}} <br/>
let's meet to discuss ... <br/>
Thanks, <br/>
Perry.
</body>
</html>
```
template.subject.txt, e.g.:
```txt
{{firstName}} - Perry , 1 on 1  Meeting
```
once the folder is ready, run the below command in the specified folder:
```bash
$ meetingbooster
```
Running The Test Suite
----------------------

**Console:**

To run the test suite from the console, you need to have `mocha` installed:
```bash
$ npm install -g mocha
```
Then from the root of the project, you can just call
```bash
$ mocha
```
Alternately, if you've installed the dependencies, via:
```bash
$ npm install
```
then you can run the tests (and get detailed output) by running:
```bash
$ gulp test
```