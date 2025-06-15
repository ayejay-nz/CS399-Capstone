# Shuffle Backend Server

This is the backend server for the Shuffle application, providing API endpoints for exam generation and processing.

## Getting Started

### Running the Server

```bash
# Start the server with Docker
docker compose up

# Or run locally
npm install
npm run dev
```

### Development Setup

The server is built with:
- Node.js + Express
- TypeScript
- Swagger for API documentation

## API Documentation

The API is documented using Swagger UI. Once the server is running, you can access the documentation at:

```
http://localhost:8000/api-docs
```

## API Endpoints

### Exam Source
- `POST /api/v1/exam-source/upload-json` - Upload exam data in JSON format
- `POST /api/v1/exam-source/upload-file` - Upload exam source files (DOCX, TXT, XML, TEX)

### File Upload Guidelines

When using the file upload endpoints, make sure to use the correct field names:
- `examSourceFile` - For exam source files (DOCX, TXT, XML, TEX)
- `coverPageFile` - For cover page files (DOCX)
- `teleformDataFile` - For teleform data files (TXT) 
- `answerKeyFile` - For answer key files (XLSX)
- `assetFile` - For asset files (PNG, JPEG)

## Adding More API Documentation

To add documentation for more routes, use JSDoc with Swagger annotations. Example:

```typescript
/**
 * @swagger
 * /your-endpoint:
 *   post:
 *     summary: Description of your endpoint
 *     tags:
 *       - Tag Name
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success response
 */
``` 