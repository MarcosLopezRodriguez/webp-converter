import { useState } from "react";
import JSZip from "jszip";
import saveAs from "file-saver";

export default function WebpToJpgConverter() {
    const [jpgUrls, setJpgUrls] = useState([]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((file) => file.type === "image/webp");

        if (validFiles.length === 0) {
            alert("Por favor, selecciona archivos .webp válidos");
            return;
        }

        validFiles.forEach((file) => convertToJpg(file));
    };

    const convertToJpg = (file) => {
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
            const jpgDataUrl = canvas.toDataURL("image/jpeg", 1.0);
            setJpgUrls((prev) => [...prev, { name: file.name.replace(/\.webp$/i, ".jpg"), url: jpgDataUrl }]);
        };

        reader.readAsDataURL(file);
    };

    const handleDownload = (jpg) => {
        const a = document.createElement("a");
        a.href = jpg.url;
        a.download = jpg.name;
        a.click();
    };

    const handleDownloadAllZip = async () => {
        if (jpgUrls.length === 0) return;
        const zip = new JSZip();
        const folder = zip.folder("jpgs");

        const blobPromises = jpgUrls.map(async (jpg) => {
            const response = await fetch(jpg.url);
            const blob = await response.blob();
            folder.file(jpg.name, blob);
        });

        await Promise.all(blobPromises);

        const zipBlob = await zip.generateAsync({ type: "blob" });
        saveAs(zipBlob, "imagenes_convertidas.zip");
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem", padding: "1.5rem", maxWidth: "960px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Conversor WEBP a JPG</h1>
            <input
                type="file"
                accept="image/webp"
                multiple
                onChange={handleFileChange}
                style={{ maxWidth: "400px", width: "100%" }}
            />

            {jpgUrls.length > 0 && (
                <button onClick={handleDownloadAllZip} style={{ padding: "0.5rem 1rem", backgroundColor: "#4f46e5", color: "white", borderRadius: "0.5rem", marginTop: "1rem" }}>
                    Descargar todo en ZIP
                </button>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem", width: "100%", marginTop: "1.5rem" }}>
                {jpgUrls.map((jpg, idx) => (
                    <div key={idx} style={{ border: "1px solid #ccc", borderRadius: "0.5rem", padding: "1rem", textAlign: "center" }}>
                        <img src={jpg.url} alt={jpg.name} style={{ maxHeight: "200px", objectFit: "contain", marginBottom: "0.5rem" }} />
                        <p style={{ fontSize: "0.875rem", wordWrap: "break-word" }}>{jpg.name}</p>
                        <button onClick={() => handleDownload(jpg)} style={{ marginTop: "0.5rem", padding: "0.25rem 0.75rem", backgroundColor: "#10b981", color: "white", borderRadius: "0.375rem" }}>
                            Descargar
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
