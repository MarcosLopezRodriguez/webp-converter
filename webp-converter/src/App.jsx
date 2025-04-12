import { useState, useEffect } from "react";
import WebpToJpgConverter from "./components/WebpToJpgConverter.jsx";

const translations = {
  en: {
    title: "WEBP to Other Formats Converter",
    dragDrop: "Or drag and drop your files here",
    downloadAll: "Download All as ZIP",
    clearList: "Clear List",
  },
  es: {
    title: "Conversor WEBP a Otros Formatos",
    dragDrop: "O arrastra y suelta tus archivos aquí",
    downloadAll: "Descargar todo en ZIP",
    clearList: "Limpiar lista",
  },
};

function App() {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const browserLanguage = navigator.language.slice(0, 2);
    setLanguage(translations[browserLanguage] ? browserLanguage : "en");
  }, []);

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1>{t.title}</h1>
      <p>{t.dragDrop}</p>
      <button>{t.downloadAll}</button>
      <button>{t.clearList}</button>
      <WebpToJpgConverter />
    </div>
  );
}

export default App;
