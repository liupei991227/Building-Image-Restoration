from flask import Flask, request, jsonify
from PIL import Image
import torch
from diffusers import StableDiffusionPipeline
import base64
from io import BytesIO

app = Flask(__name__)

# 配置模型
pipe = StableDiffusionPipeline.from_pretrained(
    "CompVis/stable-diffusion-v1-4",
    use_auth_token="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"
).to("cuda" if torch.cuda.is_available() else "cpu")

def image_to_base64(image):
    buffered = BytesIO()
    image.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode()

@app.route("/generate", methods=["POST"])
def generate():
    # 从请求中获取图像和描述
    file = request.files["image"]
    description = request.form["description"]

    # 打开图像
    input_image = Image.open(file).convert("RGB")

    # 使用文本描述生成修复图像
    generated_image = pipe(description).images[0]

    # 将生成的图像转换为base64编码
    image_base64 = image_to_base64(generated_image)

    return jsonify({"image_base64": image_base64})

if __name__ == "__main__":
    app.run()
