import logging
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.utils.exceptions import CineBookException

logger = logging.getLogger("cinebook.api")

async def cinebook_exception_handler(request: Request, exc: CineBookException):
    logger.warning(f"CineBookException on {request.method} {request.url.path}: {exc.message} [{exc.error_code}]")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "error_code": exc.error_code,
            "details": exc.details
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.info(f"Validation error on {request.method} {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Invalid request parameters or payload",
            "error_code": "VALIDATION_ERROR",
            "details": {"errors": exc.errors()}
        }
    )

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.info(f"HTTPException on {request.method} {request.url.path}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": str(exc.detail),
            "error_code": f"HTTP_{exc.status_code}",
            "details": {}
        }
    )

async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "An unexpected server error occurred. Please try again later.",
            "error_code": "INTERNAL_SERVER_ERROR",
            "details": {}
        }
    )
