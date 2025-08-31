from fastapi import FastAPI
from backend.routers import quiz, auth, progress, employee, manager, ai_training
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to http://localhost:5173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quiz.router)
app.include_router(employee.router)
app.include_router(manager.router)
app.include_router(ai_training.router)
# app.include_router(auth.router)
# app.include_router(progress.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Lerna AI backend!"}
