# Image Processing API

This is a full-stack image processing application that provides advanced image manipulation capabilities with user authentication and real-time processing updates.

> 📌 This project is a solution to the [Image Processing Service
> ](https://roadmap.sh/projects/image-processing-service) listed on [roadmap.sh's Backend Developer Roadmap](https://roadmap.sh/backend).

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Author](#author)

## Overview

### The challenge

Users should be able to:

- Register and authenticate their account with email verification
- Upload images securely to AWS S3 using presigned URLs
- Process images with various operations (resize, rotate, flip, mirror, format conversion)
- Receive real-time notifications about processing status via WebSocket
- View all their uploaded and processed images
- Monitor job queues and processing status through admin dashboard
- Experience secure and scalable image processing with background job handling

### Screenshot

![Image Processing API Dashboard](./screenshot.png)

### Links

- Solution URL: [https://github.com/karishma-dev/image_processing](https://github.com/karishma-dev/image_processing)
- Live API URL: [Add your deployed API URL here]
- API Documentation: [Add your API docs URL here]

## My process

### Built with

- **Backend Framework**: Node.js with Express.js and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Queue System**: BullMQ with Redis for background job processing
- **Image Processing**: Sharp for high-performance image manipulation
- **Cloud Storage**: AWS S3 with presigned URLs for secure uploads
- **Authentication**: JWT with bcryptjs for secure user authentication
- **Real-time Communication**: WebSocket for live processing updates
- **Security**: Helmet, rate limiting, input sanitization, and CORS
- **Documentation**: Swagger/OpenAPI for interactive API documentation
- **Monitoring**: Bull Board for queue visualization and management
- **Email Services**: Nodemailer for verification and password reset emails
- **Validation**: Zod schemas for type-safe request validation
- **Containerization**: Docker with multi-stage builds

### What I learned

This project taught me about building scalable backend architectures with:

- **Queue-based Processing**: Implementing background job processing for CPU-intensive image operations
- **Real-time Communication**: Using WebSockets to provide live updates to users
- **Cloud Integration**: Working with AWS S3 for secure file storage and presigned URLs
- **Database Design**: Creating efficient schemas with Prisma for user management and image metadata
- **Security Best Practices**: Implementing comprehensive security measures for a production API
- **Microservices Architecture**: Separating concerns with dedicated worker processes

### Continued development

Future enhancements I want to add:

- Public image sharing functionality
- Image liking and social features
- Batch image processing capabilities
- Image compression optimization
- Watermarking features
- Advanced image filters and effects

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/karishma-dev/image_processing.git
   cd image_processing
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file with:

   ```env
   PORT=3000
   DATABASE_URL="postgresql://username:password@localhost:5432/image_processing"
   REDIS_URL="redis://localhost:6379"
   JWT_SECRET=your_jwt_secret
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=your-bucket-name
   # Add other required environment variables
   ```

4. **Set up the database:**

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

5. **Start Redis:**
   ```bash
   redis-server
   ```

## Usage

### Development

```bash
# Start the API server
npm run dev

# Start the image processing worker
npm run worker
```

### Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

### Docker

```bash
# Build and run with Docker
docker build -t image-processing-api .
docker run -p 3000:3000 --env-file .env image-processing-api
```

## API Endpoints

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-email` - Email verification
- `POST /auth/forgot-password` - Password reset request

### Image Management

- `GET /images` - Get all user images
- `POST /images/presign` - Get presigned URL for upload
- `POST /images/confirm` - Confirm upload completion
- `GET /images/:id` - Get specific image
- `DELETE /images/:id` - Delete image

### Image Processing

- `POST /images/resize` - Resize image
- `POST /images/rotate` - Rotate image
- `POST /images/flip` - Flip image
- `POST /images/mirror` - Mirror image
- `POST /images/changeFormat` - Change format
- `POST /images/allOperations` - Apply multiple operations

## Author

- GitHub - [karishma-dev](https://github.com/karishma-dev)
- Twitter - [@\_karishma10](https://twitter.com/_karishma10)
- LinkedIn - [Karishma Garg](https://www.linkedin.com/in/karishma-garg-)
- CodePen - [karishma-dev](https://codepen.io/karishma-dev)
