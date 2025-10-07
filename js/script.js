document.addEventListener("DOMContentLoaded", () => {
    // Activate Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl));

    // DOM Elements
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const uploadImage = document.getElementById("uploadImage");
    const brushSizeInput = document.getElementById("brushSize");
    const numImagesInput = document.getElementById("numImages");
    const guidanceScaleInput = document.getElementById("guidanceScale");
    const brushSizeValue = document.getElementById("brushSizeValue");
    const numImagesValue = document.getElementById("numImagesValue");
    const guidanceScaleValue = document.getElementById("guidanceScaleValue");
    const descriptionInput = document.getElementById("description");
    const generateButton = document.getElementById("generateButton");
    const clearButton = document.getElementById("clearButton");
    const resultImages = document.getElementById("resultImages");
    const loadingText = document.getElementById("loading");
    let drawing = false;
    let image = null;
    let startX, startY;

    // Update slider values dynamically
    const updateSliderValue = (input, display) => {
        input.addEventListener("input", () => {
            display.textContent = input.value;
        });
    };
    updateSliderValue(brushSizeInput, brushSizeValue);
    updateSliderValue(numImagesInput, numImagesValue);
    updateSliderValue(guidanceScaleInput, guidanceScaleValue);

    // Load image onto canvas
    uploadImage.addEventListener("change", (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            image = new Image();
            image.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            };
            image.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Drawing functions
    const drawBrush = (x, y) => {
        const brushSize = parseInt(brushSizeInput.value, 10);
        ctx.globalAlpha = 0.5; // Semi-transparent for visualization
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.beginPath();
        ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0; // Reset transparency
    };

    const drawRectangle = (x, y, width, height) => {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillRect(x, y, width, height);
        ctx.globalAlpha = 1.0;
    };

    // Prepare binary mask before sending to backend
    const prepareBinaryMask = async () => {
        const maskCanvas = document.createElement("canvas");
        const maskCtx = maskCanvas.getContext("2d");
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;

        // Copy canvas content to mask canvas
        maskCtx.drawImage(canvas, 0, 0);

        // Binarize the mask data
        const imageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const brightness = data[i]; // Only check R channel
            const binarizedValue = brightness > 128 ? 255 : 0;
            data[i] = binarizedValue;
            data[i + 1] = binarizedValue;
            data[i + 2] = binarizedValue;
            data[i + 3] = 255; // Fully opaque
        }
        maskCtx.putImageData(imageData, 0, 0);

        // Return binary mask as Blob
        return new Promise((resolve) => maskCanvas.toBlob(resolve, "image/png"));
    };

    // Canvas interactions
    canvas.addEventListener("mousedown", (e) => {
        const mode = document.querySelector('input[name="mode"]:checked').value;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (mode === "brush") {
            drawing = true;
            drawBrush(x, y);
        } else {
            startX = x;
            startY = y;
            drawing = true;
        }
    });

    canvas.addEventListener("mousemove", (e) => {
        if (drawing && document.querySelector('input[name="mode"]:checked').value === "brush") {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            drawBrush(x, y);
        }
    });

    canvas.addEventListener("mouseup", (e) => {
        if (document.querySelector('input[name="mode"]:checked').value === "rectangle" && drawing) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const width = x - startX;
            const height = y - startY;
            drawRectangle(startX, startY, width, height);
        }
        drawing = false;
    });

    // Clear canvas
    clearButton.addEventListener("click", () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (image) {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        }
    });

    // Send data to backend
    generateButton.addEventListener("click", async () => {
		const description = descriptionInput.value;
		const numImages = numImagesInput.value;
		const guidanceScale = guidanceScaleInput.value;

		if (!image) {
			alert("Please upload an image.");
			return;
		}
		if (!description.trim()) {
			alert("Please enter a description.");
			return;
		}

		loadingText.classList.remove("d-none");

		const imageBlob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
		const maskBlob = await prepareBinaryMask();

		console.log("Image Blob:", imageBlob);  // 验证是否生成图像 Blob
		console.log("Mask Blob:", maskBlob);    // 验证是否生成遮罩 Blob

		const formData = new FormData();
		formData.append("image", imageBlob);
		formData.append("mask", maskBlob);
		formData.append("description", description);
		formData.append("num_images", numImages);
		formData.append("guidance_scale", guidanceScale);

		// 打印 FormData 的所有内容
		for (const [key, value] of formData.entries()) {
			console.log(`${key}:`, value);
		}

		try {
			const response = await fetch("https://7300-34-23-242-237.ngrok-free.app/generate", {
				method: "POST",
				body: formData,
			});
			const data = await response.json();
			resultImages.innerHTML = "";
			data.images.forEach((imgBase64) => {
				const imgElement = document.createElement("img");
				imgElement.src = "data:image/png;base64," + imgBase64;
				resultImages.appendChild(imgElement);
			});
		} catch (error) {
			alert("An error occurred while generating the images.");
			console.error("Error:", error);
		} finally {
			loadingText.classList.add("d-none");
		}
	});

});
