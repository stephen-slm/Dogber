<h1 align="center">
    <a href="https://github.com/tehstun/Dogber">
      <img src="https://i.imgur.com/UeDgJwK.png" alt="dogber-logo" width="100">
    </a>
    <br>Dogber<br>
</h1>

<h4 align="center">Dogber is the Uber for dogs, allowing owners to get there dogs walked when they are busy, away or lazy by dog lovers who are active, free and in need of some extra cash.</h4>
<h5 align="center">University Software Engineering Programming Project 30%</h5>
<h6 align="center">Resulting grade: 100/100</h6>

---

- [Stack:](#stack-)
- [Project Structure](#project-structure)
- [Travis](#travis)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installing](#installing)
- [Running the application (or visit https://app.dogber.co.uk)](#running-the-application--or-visit-https---appdogbercouk-)
- [Running the Linting Process](#running-the-linting-process)
- [Running the tests](#running-the-tests)
- [Running the Precommit Process](#running-the-precommit-process)
- [Built With](#built-with)
- [Versioning](#versioning)
- [Authors / Legend (Current Contributions)](#authors---legend--current-contributions-)
- [License](#license)

## Stack:

[![Build Status](https://travis-ci.com/tehstun/Dogber.svg?token=yBBSq1qd5HMhutV7avm8&branch=master)](https://travis-ci.com/tehstun/Dogber)
[![Build Status](https://travis-ci.com/tehstun/Dogber.svg?token=yBBSq1qd5HMhutV7avm8&branch=develop)](https://travis-ci.com/tehstun/Dogber)

![Firebase](https://img.shields.io/npm/v/firebase.svg?label=Firebase&logo=Firebase)
![VueJs](https://img.shields.io/npm/v/vue.svg?label=VueJs&logo=Vue)
![Vuetify](https://img.shields.io/npm/v/vuetify.svg?label=Vuetify&logo=Vuetify)
![Jest](https://img.shields.io/npm/v/jest.svg?label=Jest&logo=Jest)

---

<img src="https://i.imgur.com/muL4NQS.png" width=250>

## Project Structure

Overview

    ├── src                           - Main App
    |   ├── assets                      - Images and general assets that will be required into pages.
    |   ├── components                  - Components that are used to build up complete pages. e.g Loading.
    |   ├── constants                   - Fixed values that don't change during the runtime of the app.
    |   ├── lib                       - Libraries that integrate into external systems. e.g Firebase.
    |   ├── views                       - The complete pages build with components.
    ├── test                           - tests to validate completeness and correctness.
    |   ├── unit                        - The unit tests for the app.

Dogber is the Uber for dogs, allowing owners to get there dogs walked when they are busy, away or lazy by dog lovers who are active, free and in need of some extra cash.

## Travis

Travis is being used to autotest all branches, pull requests and changes on any non-master content, while all master pull requests result in a complete build and deployment to http://app.dogber.co.uk - (https://travis-ci.com/tehstun/Dogber)

<img src="https://i.imgur.com/mCBEZSa.png" width=500>

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Before you can start you will need to install the latest version of [NodeJs](https://nodejs.org/en/download/).

### Installing

First, start by opening a console/terminal to the directory of the project and run the following command.

```
npm install
npm install -g @vue/cli @vue/cli-service
npm install -g firebase-tools
```

or run:

```
install.bat
```

This first command will install all the base requirements for starting up the application.
The second will install the required components used for helping with using vue as a platform.

This second command will install the tools required to deploy to firebase, this is **ONLY** required if you are planning on deploying the application and have been set up correctly on Firebase.

```
vue ui
```

or run:

```
start.bat
```

Running "vue ui" will load up a local website that can be used for the helping in the development of the application, this website will look something like the below image. We will use this website UI for building, testing and linting our code. You can follow the below information to understand how to test, run, lint and get the code ready for committing. You might have to specify the directory of dogber. This website is created by the underlining VueJs framework and is not apart of the project development.

<img align="middle" src="https://i.imgur.com/376sSE4.png" alt="Vue Ui">

## Running the application (or visit https://app.dogber.co.uk)

run

```
npm run serve
```

or follow the UI guide:

0. Making sure you have correctly ran "vue ui" in a terminal within the project directory.
1. Click Tasks from the left-hand side navigation bar (bottommost clipboard).
1. Click the "serve" option from the tasks list.
1. Click "run task"

<img align="middle" src="https://i.imgur.com/WAAqECO.png" alt="Vue Serve">

4. Clicking "open app" will load the dogber website to the login page.

From this page you can then go and edit the website, making changes to the files and as long as the run task section still says "stop task", your changes will automatically load into the website. Seeing the changes as they happen. This is your development environment.

## Running the Linting Process

Linting is run to make sure that your code is syntactically correct for the running of the application, so linting should be run before making commits, this is covered within the precommit process. To run the linting process manually to see errors that have occurred do the following.

run

```
npm run lint
```

or follow the UI guide:

0. Making sure you have correctly run "vue ui" in a terminal within the project directory.
1. Click Tasks from the left-hand side navigation bar (bottommost clipboard).
1. Click the "lint" option from the tasks list.
1. Click "run task"

<img align="middle" src="https://i.imgur.com/E3wxH0m.png" alt="Vue Lint">

When linting is all correct you will get the following message, this message is required for the commit to make it into master. All code must be valid. Additionally, it will attempt to auto-correct simple issues.

<img align="middle" src="https://i.imgur.com/CUU89pM.png" alt="Vue Lint Yes">

If the linting process fails, you will get an error message specifying what needs to change to make it pass. Make the required change and run linting again.

<img align="middle" src="https://i.imgur.com/zlW3Iv1.png" alt="Vue Lint No">

## Running the tests

Tests can be run to validate the functionality of the vue components. There are over 160 test cases which span 5 different test suits validating the core logic and functionality of the application.

run

```
npm run test
```

or follow the UI guide:

0. Making sure you have correctly run "vue ui" in a terminal within the project directory.
1. Click Tasks from the left-hand side navigation bar (bottommost clipboard).
1. Click the "test:unit" option from the tasks list.
1. Click "run task"

<img align="middle" src="https://i.imgur.com/Kvb3U9D.png" alt="Vue Test Unit">

If tests pass you will get a message stating the tests that have passed.

<img align="middle" src="https://i.imgur.com/MsWh5et.png" alt="Vue Test Unit Pass">

If the tests failed you will get a message telling you which failed and why. Fix the tests before committing into the branch. All tests must pass before committing.

<img align="middle" src="https://i.imgur.com/UUzjaKt.png" alt="Vue Test Unit Fail">

## Running the Precommit Process

Precommit process must be run (which runs the tests and the linting process) and must pass before you commit code into the project. This is to ensure that the code going in is correct and will function properly.

run

```
npm run precommit
```

or follow the UI guide:

0. Making sure you have correctly run "vue ui" in a terminal within the project directory.
1. Click Tasks from the left-hand side navigation bar (bottommost clipboard).
1. Click the "precommit" option from the tasks list.
1. Click "run task"

<img align="middle" src="https://i.imgur.com/C0ZirbL.png" alt="Vue PreCommit">

## Built With

- [Firebase](http://www.firebase.com) - The web hosting/database framework
- [Vue](https://vuejs.org/) - The web framework for responsive design.
- [Vuetifyjs](https://vuetifyjs.com/en/) - The web framework UI components.
- [Jest](https://jestjs.io/) - The Testing Framework.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/tehstun/dogber/tags).

## Authors / Legend (Current Contributions)

- **UP840877** - _Developer_ - [tehstun](https://github.com/tehstun)
- **UP806612** - _Developer_ - [up806612](https://github.com/up806612)
- **UP745708** - _Developer_ - [Muklek](https://github.com/Muklek)

## License

This project is licensed under the MIT License
