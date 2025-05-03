export const HTTP_STATUS_CODE = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    REQUEST_TIMEOUT: 408,
    CONTENT_TOO_LARGE: 413,
    UNSUPPORTED_MEDIA_TYPE: 415,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    SERVER_ERROR: 500,
};

export const API_ERROR_MESSAGE = {
    // General Errors
    serverError: 'Something went wrong, try again later',
    notFound: 'The requested resource was not found',
    badRequest: 'The request was invalid or cannot be otherwise served',
    tooManyRequests: 'You have sent too many requests in a short period. Please try again later',
    requestTimeout: 'The request timed out. Please try again',

    // File Upload Errors
    noFileUpload: 'No file was uploaded: Please attach a file',
    fileTooLarge: 'The uploaded file exceeds the allowed size limit',
    unsupportedFileType:
        'The uploaded file type is not supported. Please use one of the allowed formats',

    // Parsing Errors
    invalidFileFormat:
        'The uploaded file format is invalid or corrupt. Please check the file and try again',
    parsingFailed:
        'Failed the process the file content. Please ensure it matches the expected format',
    docxParseFailed: 'Failed to parse the DOCX file. Please check its structure and content',
    latexParseFailed: 'Failed to parse the LaTeX file. Please check its structure and content',
    txtParseFailed: 'Failed to parse the TXT file. Please check its structure and content',
    xmlParseFailed: 'Failed to parse the XML file. Please check its structure and content',
    teleformParseFailed: 'Failed to parse the Teleform data file. Please check its format',

    // Processing Errors
    missingRequiredData:
        'Required data is missing within the provided file (e.g. missing questions, student IDs, ...)',
    solutionGenerationFailed: 'Could not generate the solution key from the provided source',
    markingProcessFailed: 'An error occurred during the marking process',
    statsGenerationFailed: 'Failed to generate the required statistics or results files',
    invalidInputData: 'The data provided contains invalid values',

    // Editing Errors
    editTargetNotFound: 'The item you are trying to edit could not be found',
    invalidEditInput: 'The update request contains invalid data',
    invalidAnswerUpdate:
        'Cannot set the correct answer(s). The provided change is invalid for the available options',
    invalidFeedbackUpdate: 'The provided feedback is invalid (e.g. format, length, ...)',
    updateFailed: 'Failed to save the requested changes',
};

export const API_ERROR_CODE = {
    // General Errors
    SERVER_ERROR: 'SERVER_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    BAD_REQUEST: 'BAD_REQUEST',
    TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
    REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',

    // File Upload Errors
    NO_FILE_UPLOAD: 'NO_FILE_UPLOAD',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    UNSUPPORTED_FILE_TYPE: 'UNSUPPORTED_FILE_TYPE',

    // Parsing Errors
    INVALID_FILE_FORMAT: 'INVALID_FILE_FORMAT',
    PARSING_FAILED: 'PARSING_FAILED',
    DOCX_PARSE_FAILED: 'DOCX_PARSE_FAILED',
    LATEX_PARSE_FAILED: 'LATEX_PARSE_FAILED',
    TXT_PARSE_FAILED: 'TXT_PARSE_FAILED',
    XML_PARSE_FAILED: 'XML_PARSE_FAILED',
    TELEFORM_PARSE_FAILED: 'TELEFORM_PARSE_FAILED',

    // Processing Errors
    MISSING_REQUIRED_DATA: 'MISSING_REQUIRED_DATA',
    SOLUTION_GENERATION_FAILED: 'SOLUTION_GENERATION_FAILED',
    MARKING_PROCESS_FAILED: 'MARKING_PROCESS_FAILED',
    STATS_GENERATION_FAILED: 'STATS_GENERATION_FAILED',
    INVALID_INPUT_DATA: 'INVALID_INPUT_DATA',

    // Editing Errors
    EDIT_TARGET_NOT_FOUND: 'EDIT_TARGET_NOT_FOUND',
    INVALID_EDIT_INPUT: 'INVALID_EDIT_INPUT',
    INVALID_ANSWER_UPDATE: 'INVALID_ANSWER_UPDATE',
    INVALID_FEEDBACK_UPDATE: 'INVALID_FEEDBACK_UPDATE',
    UPDATE_FAILED: 'UPDATE_FAILED',
};

export const API_SUCCESS_MESSAGE = {
    ok: 'Request processed successfully',
    created: 'Resource created successfully',
    accepted: 'Request accepted and is being processed',
};
