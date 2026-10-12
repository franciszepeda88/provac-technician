// Comprime y redimensiona una foto tomada con la cámara antes de guardarla
// en el formulario. Las fotos de un iPhone moderno pueden pesar 3-8MB cada
// una; sin esto, un levantamiento con varias fotos genera un payload de
// decenas de MB que en una conexión débil (común en campo, en las
// instalaciones del cliente) nunca termina de subir: la app lo "guarda"
// localmente como pendiente sin conexión y se queda atascado ahí, dando la
// impresión de que el levantamiento "no se guardó" aunque el técnico haya
// llenado todo correctamente.
//
// Redimensiona al lado más largo = maxDim y recomprime como JPEG a la
// calidad indicada, lo que típicamente deja cada foto en 150-400KB sin
// pérdida visible de detalle relevante para el levantamiento.
export function comprimirImagen(file, { maxDim = 1600, calidad = 0.75 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error || new Error('No se pudo leer la imagen'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('No se pudo procesar la imagen'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', calidad);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}
