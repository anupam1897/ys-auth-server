# ys-auth: Authentication and Authorization

This is a simple API written in JavaScript for authenticating users and authorizing resource access. It uses JWT for token generation and verification.

## Features

- Authentication using JWT tokens
- Authorization for resource access

## Usage

### Using Docker

1. **Clone the repository:**

    ```bash
    git clone https://github.com/anupam1897/ys-auth-server.git
    ```

2. **Build the Docker image:**

    ```bash
    cd ys-auth
    docker build -t ys-auth .
    ```

3. **Run the Docker container:**

    ```bash
    docker run -p 4000:4000 ys-auth
    ```

    The server will start running inside the Docker container on port 4000.

### Running on its Own

1. **Clone the repository:**

    ```bash
    git clone https://github.com/anupam1897/ys-auth-server.git
    ```

2. **Install dependencies:**

    ```bash
    cd ys-auth
    npm install
    ```

3. **Start the server:**

    ```bash
    npm start
    ```

    The server will start running on port 4000.

## Contributing

Contributions are welcome! If you have any suggestions or find any bugs, please open an [issue](https://github.com/your-username/ys-auth/issues) or submit a [pull request](https://github.com/your-username/ys-auth/pulls).

## License

This project is licensed under the [MIT License](LICENSE).
