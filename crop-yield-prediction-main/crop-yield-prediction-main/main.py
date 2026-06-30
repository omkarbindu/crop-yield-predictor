if __name__ == "__main__":
    import uvicorn
    from app.config import settings

    uvicorn.run(
        "app.app:app",
        host=settings.app_host,
        port=settings.app_port,
        reload=settings.debug,
        log_level="info",
        access_log=True,
    )