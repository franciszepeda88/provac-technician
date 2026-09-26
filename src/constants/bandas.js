// Tipos de banda disponibles y campos del Paso 1 (Datos del Cliente) que son
// comunes a los 4 formularios. Se usan para la función "Agregar otra banda":
// al guardar una banda bajo un folio y sumar otra, estos son los datos que
// se reutilizan sin pedirlos de nuevo.

export const TIPOS_BANDA = [
  { id: 'transporte', nombre: 'Banda de Transporte' },
  { id: 'transmision', nombre: 'Banda de Transmisión de Fuerza' },
  { id: 'modular', nombre: 'Banda Modular Plástica' },
  { id: 'thermodrive', nombre: 'Banda ThermoDrive' }
];

export const CAMPOS_CLIENTE = [
  'fecha',
  'entrada',
  'empresa',
  'planta',
  'contacto',
  'puesto',
  'telefono',
  'email',
  'direccion',
  'area_linea',
  'equipo_tag',
  'tecnico_provac',
  'vendedor'
];
