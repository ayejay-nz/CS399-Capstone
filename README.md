[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/4-04QCSZ)

## Run Client & Server

```
cd Server/ # or
cd Client/

# first time?
docker compose up --build
# every other time
docker compose up
```

## API Documentation

The backend API is documented using Swagger UI. Once the server is running, you can access the API documentation at:

```
http://localhost:8000/api-docs
```

The documentation provides detailed information about available endpoints, request parameters, and response formats.

## File Uploads

When uploading files via the API, make sure to use the correct field names:
- `examSourceFile` - For exam source files (DOCX, TXT, XML, TEX)
- `coverPageFile` - For cover page files (DOCX)
- `teleformDataFile` - For teleform data files (TXT)
- `answerKeyFile` - For answer key files (XLSX)
- `assetFile` - For asset files (PNG, JPEG)

## Install Packages on Docker

`docker compose exec frontend npm install <package_name>`
