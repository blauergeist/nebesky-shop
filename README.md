# Nebesky Shop

Nebesky Shop is a scalable backend e-commerce application built with Node.js and Express. It offers a wide range of features such as secure authentication, authorization and payment processing with Stripe.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Scripts](#scripts)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)

## Features

- User authentication with JSON Web Tokens (JWT)
- Secure password hashing with bcrypt
- Protection against security threats
- Rate limiting and session management
- Sending email notifications
- Image upload and resizing
- Integration with Stripe for payment processing
- Data validation and sanitation
- ESLint and Prettier for code quality

## Tech Stack

Nebesky Shop is built with the following technologies:

- Node.js and Express for the server.
- MongoDB for the database.
- Mongoose for Object Data Modelling
- Stripe for payment processing.
- ESLint and Prettier for code formatting and quality.
- Pug for server-side templating.
- Parcel for bundling JavaScript.

## Scripts

- `start`: Start the server using Nodemon.
- `start:prod`: Start the server in production mode.
- `debug`: Start the server in debug mode.
- `watch:js`: Watch JavaScript files.
- `build:js`: Build JavaScript files.

You can run these scripts using `npm run <script-name>`.

## Getting Started

### Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed on your local machine.

### Installation

To get Nebesky Shop up and running, follow these steps:

1. Clone the repository to your local machine:
  
   ```bash
   git clone https://github.com/blauergeist/nebesky-shop.git
   
2. Navigate to the Project Directory: Change your current directory to the project folder:
    ```bash
    cd nebesky-shop

3. Install Dependencies: Install the project dependencies by running the following command:

    ```bash
    npm install

4. Configure Environment Variables: Create a .env file in the root directory and configure the following environment variables:

    ```bash
    PORT=3000
    DATABASE_URL=your-database-connection-string
    JWT_SECRET=your-secret-key
    JWT_EXPIRES_IN=90d
    JWT_COOKIE_EXPIRES_IN=90
    EMAIL_USERNAME=your-email-username
    EMAIL_PASSWORD=your-email-password
    EMAIL_HOST=your-email-host
    EMAIL_PORT=your-email-port
    EMAIL_FROM=your-email-from
    STRIPE_SECRET_KEY=your-stripe-secret-key


