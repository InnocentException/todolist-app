# Todolist App

This is a todolist web application that has a lot of features. I made this app during my internship at Solunio. Therefore I wont develop this web application any further.
[![N|Solid](https://solunio.com/wp-content/uploads/2023/06/SOLUNIO_LOGO_Positiv_RGB_72dpi.png)](https://solunio.com/de)
> Solunio is a Startup that has its Headquarters in Brunico in South Tyrol.
> This startup specializes in shop floor management and is currently developing a software that
> helps Companies to visuallize data in a web ui. From more information you can check out there webside by clicking on the Solunio logo.

## Technologies

- Backend: [NestJS](https://nestjs.com/) A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
- Frontend: [AngularJS](https://angular.io/) - HTML enhanced for web apps!
- Storage: [MongoDB](https://www.mongodb.com) Embrace the Power of Differences.

## Features

- Create, edit and delete accounts
- Create and delete todolists
- Create and delete todos in those todolists
- Share todolists with other accounts
- Enable MFA via email and app authentication

## Installation

The Todolist App was currently only tested with [Node.js](https://nodejs.org/) 20. You do also need to have installed
If you have node js installed you can clone this repository with git cli or download it as a zip (and unzip it).
After you have donloaded it you have two options:

### Plain

To build and start the plain project you can use the following commands:

```sh
cd todolist-app
bash build.sh
bash start.sh
export MAIL_USER=...
export MAIL_PASSWORD=...
```

### Prodman(Container)

To build the project as a container in podman you can use the following commands:

```sh
cd todolist-app
bash podman_build.sh
```

To start the container use this command

```sh
bash podman_start.sh MAIL_USER MAIL_PASSWORD MONGODB_HOST [MONGODB_PORT]
```

- MAIL_USER: Here you have to input your google email that you want to send all email MFA codes and password reset links from.
- MAIL_PASSWORD: Here you have to enter a app password from your google account associated with the email you entered before. You can look up how to create a google app password [here](https://support.google.com/mail/answer/185833?hl=en).
- MONGODB_HOST: Here you have to enter the mongodb host name

### Enviroment Variables

| FIELD | DESCRIPTION | STANDARD VALUE |
| ------ | ------ | ------ |
| SMTP_HOST | The hostname of the SMTP Server where the app can send all emails to | smtp.gmail.com |
| SMTP_PORT | The Port of the SMTP Server | / |
| MAIL_USER | The Email of the account | / |
| MAIL_PASSWORD | The password of the account | / |
| MAIL_FROM | The Email that get shown in the email program | <noreply@todolist-app.com> |
| MONGODB_HOST | The domain or ip address of the mongodb host | localhost |
| MONGODB_PORT | The port of the mongodb host | 27017 |

# License

MIT License
