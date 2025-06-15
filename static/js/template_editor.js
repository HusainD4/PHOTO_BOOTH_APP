// document.addEventListener('DOMContentLoaded', () => {
//     const canvas = document.getElementById('templateCanvas');
//     const ctx = canvas.getContext('2d');
//     const addBoxBtn = document.getElementById('addBox');
//     const positionsInput = document.getElementById('positionsInput');

//     let boxes = [];
//     let selectedBoxIndex = -1;
//     let isDragging = false;
//     let isResizing = false;
//     let offsetX = 0;
//     let offsetY = 0;
//     const resizeSize = 12;

//     // Load the template image (fixed size)
//     const templateImg = new Image();
//     templateImg.src = `/static/img/templates/${canvas.dataset.templateName || ''}`;
//     templateImg.onload = () => {
//         drawCanvas();
//         loadPositions(); // Load existing positions if any
//     };

//     function drawCanvas() {
//         // Clear
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         // Draw template
//         ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
//         // Draw camera boxes
//         boxes.forEach((box, index) => {
//             // Draw box rectangle
//             ctx.beginPath();
//             ctx.lineWidth = 2;
//             ctx.strokeStyle = 'red';
//             ctx.rect(box.x, box.y, box.width, box.height);
//             ctx.stroke();

//             // Draw label
//             ctx.font = '16px Arial';
//             ctx.fillStyle = 'black';
//             ctx.fillText(`Take ${index + 1}`, box.x + 5, box.y + 20);

//             // Draw resize handle (bottom-right corner)
//             drawResizeHandle(box.x + box.width, box.y + box.height);
//         });
//     }

//     function drawResizeHandle(x, y) {
//         ctx.fillStyle = 'blue';
//         ctx.fillRect(x - resizeSize / 2, y - resizeSize / 2, resizeSize, resizeSize);
//     }

//     function isInBox(x, y, box) {
//         return x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height;
//     }

//     function isInResizeHandle(x, y, box) {
//         const handleX = box.x + box.width;
//         const handleY = box.y + box.height;
//         return (
//             x >= handleX - resizeSize &&
//             x <= handleX + resizeSize &&
//             y >= handleY - resizeSize &&
//             y <= handleY + resizeSize
//         );
//     }

//     addBoxBtn.addEventListener('click', () => {
//         // Add new box with default size and position inside canvas
//         boxes.push({ x: 50, y: 50, width: 200, height: 150 });
//         updatePositions();
//         drawCanvas();
//     });

//     canvas.addEventListener('mousedown', (e) => {
//         const rect = canvas.getBoundingClientRect();
//         const mouseX = e.clientX - rect.left;
//         const mouseY = e.clientY - rect.top;

//         selectedBoxIndex = -1;
//         isDragging = false;
//         isResizing = false;

//         // Check if mouse down on any box (prioritize resizing)
//         for (let i = boxes.length - 1; i >= 0; i--) {
//             const box = boxes[i];
//             if (isInResizeHandle(mouseX, mouseY, box)) {
//                 selectedBoxIndex = i;
//                 isResizing = true;
//                 break;
//             }
//             if (isInBox(mouseX, mouseY, box)) {
//                 selectedBoxIndex = i;
//                 isDragging = true;
//                 offsetX = mouseX - box.x;
//                 offsetY = mouseY - box.y;
//                 break;
//             }
//         }
//     });

//     canvas.addEventListener('mousemove', (e) => {
//         const rect = canvas.getBoundingClientRect();
//         const mouseX = e.clientX - rect.left;
//         const mouseY = e.clientY - rect.top;

//         // Change cursor when hovering
//         let hoverOnHandle = false;
//         let hoverOnBox = false;
//         for (let box of boxes) {
//             if (isInResizeHandle(mouseX, mouseY, box)) {
//                 hoverOnHandle = true;
//                 break;
//             }
//             if (isInBox(mouseX, mouseY, box)) {
//                 hoverOnBox = true;
//             }
//         }
//         if (hoverOnHandle) {
//             canvas.style.cursor = 'nwse-resize';
//         } else if (hoverOnBox) {
//             canvas.style.cursor = 'move';
//         } else {
//             canvas.style.cursor = 'default';
//         }

//         // Dragging box
//         if (isDragging && selectedBoxIndex !== -1) {
//             let box = boxes[selectedBoxIndex];
//             box.x = mouseX - offsetX;
//             box.y = mouseY - offsetY;
//             // Keep inside canvas bounds
//             box.x = Math.min(Math.max(0, box.x), canvas.width - box.width);
//             box.y = Math.min(Math.max(0, box.y), canvas.height - box.height);
//             drawCanvas();
//         }

//         // Resizing box
//         if (isResizing && selectedBoxIndex !== -1) {
//             let box = boxes[selectedBoxIndex];
//             box.width = Math.max(30, mouseX - box.x);
//             box.height = Math.max(30, mouseY - box.y);
//             // Keep inside canvas bounds
//             box.width = Math.min(box.width, canvas.width - box.x);
//             box.height = Math.min(box.height, canvas.height - box.y);
//             drawCanvas();
//         }
//     });

//     canvas.addEventListener('mouseup', () => {
//         if (isDragging || isResizing) {
//             updatePositions();
//         }
//         isDragging = false;
//         isResizing = false;
//         selectedBoxIndex = -1;
//     });

//     // Save positions JSON string to hidden input
//     function updatePositions() {
//         positionsInput.value = JSON.stringify(boxes);
//     }

//     // Load positions from input if available (e.g. after page reload or editing)
//     function loadPositions() {
//         if (positionsInput.value) {
//             try {
//                 const savedBoxes = JSON.parse(positionsInput.value);
//                 if (Array.isArray(savedBoxes)) {
//                     boxes = savedBoxes.map(box => ({
//                         x: box.x,
//                         y: box.y,
//                         width: box.width,
//                         height: box.height
//                     }));
//                     drawCanvas();
//                 }
//             } catch (e) {
//                 console.error('Gagal parse posisi kamera:', e);
//             }
//         }
//     }
// });


document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('templateCanvas');
    const ctx = canvas.getContext('2d');
    const addBoxBtn = document.getElementById('addBox');
    const positionsInput = document.getElementById('positionsInput');

    let boxes = [];
    let selectedBoxIndex = -1;
    let isDragging = false;
    let isResizing = false;
    let offsetX = 0;
    let offsetY = 0;
    const resizeSize = 12;

    const templateImg = new Image();
    templateImg.src = `/static/img/templates/${canvas.dataset.templateName || ''}`;
    templateImg.onload = () => {
        // Set canvas size to image size
        canvas.width = templateImg.naturalWidth;
        canvas.height = templateImg.naturalHeight;

        drawCanvas();
        loadPositions();
    };

    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (evt.clientX - rect.left) * scaleX,
            y: (evt.clientY - rect.top) * scaleY
        };
    }

    function drawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Gambar kotak kamera dulu (background)
        boxes.forEach((box, index) => {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.rect(box.x, box.y, box.width, box.height);
            ctx.stroke();

            ctx.font = '16px Arial';
            ctx.fillStyle = 'black';
            ctx.fillText(`Take ${index + 1}`, box.x + 5, box.y + 20);

            drawResizeHandle(box.x + box.width, box.y + box.height);
        });

        // Gambar template di atas dengan opacity agar kotak tetap terlihat
        ctx.globalAlpha = 0.7; // atur transparansi template (0.0 - 1.0)
        ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0; // reset alpha ke default
    }


    function drawResizeHandle(x, y) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(x - resizeSize / 2, y - resizeSize / 2, resizeSize, resizeSize);
    }

    function isInBox(x, y, box) {
        return x >= box.x && x <= box.x + box.width &&
               y >= box.y && y <= box.y + box.height;
    }

    function isInResizeHandle(x, y, box) {
        const handleX = box.x + box.width;
        const handleY = box.y + box.height;
        return (
            x >= handleX - resizeSize &&
            x <= handleX + resizeSize &&
            y >= handleY - resizeSize &&
            y <= handleY + resizeSize
        );
    }

    addBoxBtn.addEventListener('click', () => {
        boxes.push({ x: 50, y: 50, width: 200, height: 150 });
        updatePositions();
        drawCanvas();
    });

    canvas.addEventListener('mousedown', (e) => {
        const { x: mouseX, y: mouseY } = getMousePos(canvas, e);

        selectedBoxIndex = -1;
        isDragging = false;
        isResizing = false;

        for (let i = boxes.length - 1; i >= 0; i--) {
            const box = boxes[i];
            if (isInResizeHandle(mouseX, mouseY, box)) {
                selectedBoxIndex = i;
                isResizing = true;
                break;
            }
            if (isInBox(mouseX, mouseY, box)) {
                selectedBoxIndex = i;
                isDragging = true;
                offsetX = mouseX - box.x;
                offsetY = mouseY - box.y;
                break;
            }
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        const { x: mouseX, y: mouseY } = getMousePos(canvas, e);

        // Update cursor
        let cursor = 'default';
        for (let box of boxes) {
            if (isInResizeHandle(mouseX, mouseY, box)) {
                cursor = 'nwse-resize';
                break;
            } else if (isInBox(mouseX, mouseY, box)) {
                cursor = 'move';
            }
        }
        canvas.style.cursor = cursor;

        // Drag
        if (isDragging && selectedBoxIndex !== -1) {
            let box = boxes[selectedBoxIndex];
            box.x = mouseX - offsetX;
            box.y = mouseY - offsetY;
            box.x = Math.max(0, Math.min(box.x, canvas.width - box.width));
            box.y = Math.max(0, Math.min(box.y, canvas.height - box.height));
            drawCanvas();
        }

        // Resize
        if (isResizing && selectedBoxIndex !== -1) {
            let box = boxes[selectedBoxIndex];
            box.width = Math.max(30, mouseX - box.x);
            box.height = Math.max(30, mouseY - box.y);
            box.width = Math.min(box.width, canvas.width - box.x);
            box.height = Math.min(box.height, canvas.height - box.y);
            drawCanvas();
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (isDragging || isResizing) {
            updatePositions();
        }
        isDragging = false;
        isResizing = false;
        selectedBoxIndex = -1;
    });

    function updatePositions() {
        positionsInput.value = JSON.stringify(boxes);
    }

    function loadPositions() {
        if (positionsInput.value) {
            try {
                const saved = JSON.parse(positionsInput.value);
                if (Array.isArray(saved)) {
                    boxes = saved.map(box => ({ ...box }));
                    drawCanvas();
                }
            } catch (e) {
                console.error('Gagal memuat posisi:', e);
            }
        }
    }
});
