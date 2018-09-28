# Dogber

Master [![Build Status](https://travis-ci.com/tehstun/Dogber.svg?token=yBBSq1qd5HMhutV7avm8&branch=master)](https://travis-ci.com/tehstun/Dogber)

Development: [![Build Status](https://travis-ci.com/tehstun/Dogber.svg?token=yBBSq1qd5HMhutV7avm8&branch=develop)](https://travis-ci.com/tehstun/Dogber)

Dogber is the Uber for dogs, allowing owners to get there dogs walked when they are busy, away or lazy by dog lovers who are active, free and in need of some extra cash.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

**IMPORTANT:** Git commits will be rejected on the master branch, all commits must be pushed and made on the develop branch.

### Prerequisites

Before you can start you will need to install the latest version of [NodeJs](https://nodejs.org/en/download/).

### Installing

First start by opening a console/terminal to the directory of the project and run the following command.

```
npm install
```

This first commmand will install all the base requirements for starting up the application.

```
npm install -g firebase-tools
```

This second command will install the tools required to deploy to firebase, this is only required if you are planning on deploying the application and have been setup correctly on firebase.

```
npm run serve
```

Compiles and hot-reloads for development, you can now access the envrionment from the web browser for viewing. Making changes will be reflected on the page.

```
npm run build
```

Builds the project into a set of files that can be deployed to firebase.

## Running the tests

Tests can be ran to validate the functionality of the vue components.

```
npm run test:unit
```

### And coding style tests

Code must pass linting before it can be commited.

```
npm run lint
```

## Deployment

```
npm run deploy
```

This command will build and deploy up to firebase if you are setup and configured too.

## Built With

- [Firebase](http://www.firebase.com) - The web hosting/database framework
- [Vue](https://vuejs.org/) - The web framework for responsive design.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

- **Stephen Lineker-Miller** - _Core Infrastructure_ - [tehstun](https://github.com/tehstun)

## License

This project is licensed under the MIT License
