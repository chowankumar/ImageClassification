from fastapi import FastAPI, Form
from fastapi.responses import JSONResponse
import util

app = FastAPI()

@app.post("/classify_image")
async def classify_image(image_data: str = Form(...)):
    response_data = util.classify_image(image_data)
    response = JSONResponse(content=response_data)
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

if __name__ == "__main__":
    import uvicorn

    print("Starting FastAPI Server For Sports Celebrity Image Classification")
    util.load_saved_artifacts()
    uvicorn.run(app, host="0.0.0.0", port=5000)