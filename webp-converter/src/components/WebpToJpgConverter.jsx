import React, { useState } from "react";
import JSZip from "jszip";
import saveAs from "file-saver";

/**
 * WebpToJpgConverter Component
 * Handles the conversion of WebP images to other formats (JPG, PNG, BMP).
 * Provides drag-and-drop functionality and file input for uploading images.
 */
export default function WebpToJpgConverter() {
    const [jpgUrls, setJpgUrls] = useState([]);
    const [outputFormat, setOutputFormat] = useState("jpeg");
    const [isDragging, setIsDragging] = useState(false);

    /**
     * Handles file input change event.
     * @param {Event} e - The file input change event.
     */
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        processFiles(files);
    };

    /**
     * Processes the uploaded files and filters valid WebP images.
     * @param {File[]} files - Array of uploaded files.
     */
    const processFiles = (files) => {
        const validFiles = files.filter((file) => file.type === "image/webp");

        if (validFiles.length === 0) {
            alert("Por favor, selecciona archivos .webp válidos");
            return;
        }

        validFiles.forEach((file) => convertToFormat(file));
    };

    /**
     * Converts a WebP image to the selected output format.
     * @param {File} file - The WebP image file to convert.
     */
    const convertToFormat = (file) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = function (e) {
            img.src = e.target.result;
        };

        img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL(`image/${outputFormat}`, 1.0);
            setJpgUrls((prev) => [...prev, { name: file.name.replace(/\.webp$/i, `.${outputFormat}`), url: dataUrl }]);
        };

        reader.readAsDataURL(file);
    };

    /**
     * Clears the list of converted images.
     */
    const clearImages = () => {
        setJpgUrls([]);
    };

    /**
     * Removes a specific image from the list.
     * @param {number} index - The index of the image to remove.
     */
    const removeImage = (index) => {
        setJpgUrls((prev) => prev.filter((_, i) => i !== index));
    };

    /**
     * Handles the drag-over event for drag-and-drop functionality.
     * @param {Event} e - The drag-over event.
     */
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    /**
     * Handles the drag-leave event for drag-and-drop functionality.
     */
    const handleDragLeave = () => {
        setIsDragging(false);
    };

    /**
     * Handles the drop event for drag-and-drop functionality.
     * @param {Event} e - The drop event.
     */
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    };

    /**
     * Downloads all converted images as a ZIP file.
     */
    const handleDownloadAllZip = async () => {
        if (jpgUrls.length === 0) return;
        const zip = new JSZip();
        const folderName = `${outputFormat}s`;
        const folder = zip.folder(folderName);

        const blobPromises = jpgUrls.map(async (jpg) => {
            const response = await fetch(jpg.url);
            const blob = await response.blob();
            folder.file(jpg.name, blob);
        });

        await Promise.all(blobPromises);

        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, `imagenes_convertidas_${outputFormat}.zip`);
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1.5rem",
                padding: "1.5rem",
                maxWidth: "100%",
                margin: "0 auto",
                border: isDragging ? "2px dashed #4f46e5" : "2px solid transparent",
                borderRadius: "0.5rem",
                backgroundColor: isDragging ? "#f0f4ff" : "white",
            }}
        >
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Conversor WEBP a Otros Formatos</h1>

            <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} style={{ padding: "0.5rem", borderRadius: "0.5rem" }}>
                <option value="jpeg">JPG</option>
                <option value="png">PNG</option>
                <option value="bmp">BMP</option>
            </select>

            <input
                type="file"
                accept="image/webp"
                multiple
                onChange={handleFileChange}
                style={{ maxWidth: "400px", width: "100%" }}
            />

            <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>O arrastra y suelta tus archivos aquí</p>

            {jpgUrls.length > 0 && (
                <>
                    <button onClick={handleDownloadAllZip} style={{ padding: "0.5rem 1rem", backgroundColor: "#4f46e5", color: "white", borderRadius: "0.5rem", marginTop: "1rem" }}>
                        Descargar todo en ZIP
                    </button>
                    <button onClick={clearImages} style={{ padding: "0.5rem 1rem", backgroundColor: "#e53e3e", color: "white", borderRadius: "0.5rem", marginTop: "1rem" }}>
                        Limpiar lista
                    </button>
                </>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem", width: "100%", marginTop: "1.5rem" }}>
                {jpgUrls.map((jpg, idx) => (
                    <div key={idx} style={{ border: "1px solid #ccc", borderRadius: "0.5rem", padding: "1rem", textAlign: "center" }}>
                        <img src={jpg.url} alt={jpg.name} style={{ maxHeight: "200px", objectFit: "contain", marginBottom: "0.5rem" }} />
                        <p style={{ fontSize: "0.875rem", wordWrap: "break-word" }}>{jpg.name}</p>
                        <button onClick={() => handleDownload(jpg)} style={{ marginTop: "0.5rem", padding: "0.25rem 0.75rem", backgroundColor: "#10b981", color: "white", borderRadius: "0.375rem" }}>
                            Descargar
                        </button>
                        <button onClick={() => removeImage(idx)} style={{ marginTop: "0.5rem", padding: "0.25rem 0.75rem", backgroundColor: "#e53e3e", color: "white", borderRadius: "0.375rem" }}>
                            Eliminar
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
