// Datos de la sección "Banda a Fabricar" del paso Confirmar Levantamiento.
// Cada tipo de banda guarda sus datos con nombres distintos, así que aquí se
// arma, por tipo, la lista de filas [etiqueta, valor] que ve el cliente antes
// de firmar: ancho, largo, espesor, guías, empujadores, empalme, material y color.
// Solo se muestran los datos que aplican a ese tipo de banda (por ejemplo, una
// banda modular no tiene espesor ni empalme).

const VACIO = '—';

const tiene = (v) => v !== null && v !== undefined && String(v).trim() !== '';

// "850" + "mm" -> "850 mm"; si no hay valor devuelve el guion.
const conUnidad = (v, unidad) => (tiene(v) ? `${v} ${unidad}` : VACIO);

// Une varias partes de texto ignorando las vacías: "Finger · 120 mm · 45°"
const unir = (partes, sep = ' · ') => {
  const limpias = partes.filter(tiene);
  return limpias.length ? limpias.join(sep) : VACIO;
};

// Para opciones con "Otro" + texto libre: usa el texto escrito cuando se eligió "Otro".
const conOtro = (valor, otro) => (valor === 'Otro' && tiene(otro) ? otro : valor);

const METODOS_UNION = {
  termofusionado: 'Termofusionado',
  vulcanizado_frio: 'Vulcanizado en frío',
  mecanico: 'Empalme mecánico'
};

const POSICIONES_GUIA = {
  central: 'Central',
  lateral_izq: 'Lateral izquierda',
  lateral_der: 'Lateral derecha',
  ambos_laterales: 'Ambos laterales'
};

const filasTransporte = (d) => {
  const empalme = conOtro(d.tipo_empalme, d.tipo_empalme_otro);
  const sinGuia = d.guia_tracking === 'Sin guía';
  const sinEmpujador = d.tacos === 'Sin Empujador';
  return [
    ['Marca / Línea', tiene(d.marca_linea) ? d.marca_linea : VACIO],
    ['Material', unir([d.material_base, tiene(d.num_capas) ? `${d.num_capas} capas` : ''])],
    ['Color', tiene(d.color) ? d.color : VACIO],
    ['Ancho', conUnidad(d.ancho_banda, 'mm')],
    ['Largo (circuito cerrado)', conUnidad(d.largo_circuito_cerrado, 'mm')],
    ['Espesor', conUnidad(d.espesor_total, 'mm')],
    ['Guías', sinGuia ? 'Sin guía' : unir([
      d.guia_tracking,
      d.guia_especificaciones,
      tiene(d.guia_indentacion) ? `indentación ${d.guia_indentacion}` : '',
      POSICIONES_GUIA[d.posicion_guia]
    ])],
    ['Empujadores', sinEmpujador ? 'Sin empujador' : unir([
      d.tacos,
      tiene(d.alto_tacos) ? `alto ${d.alto_tacos} mm` : '',
      tiene(d.paso_tacos) ? `cada ${d.paso_tacos} mm` : ''
    ])],
    ['Empalme', unir([
      empalme,
      METODOS_UNION[d.metodo_union],
      tiene(d.largo_empalme) ? `${d.largo_empalme} mm` : '',
      tiene(d.angulo_empalme) ? `${d.angulo_empalme}°` : ''
    ])]
  ];
};

const filasTransmision = (d) => [
  ['Línea', unir([d.linea_habasit, d.codigo_articulo])],
  ['Material', tiene(d.material_nucleo) ? conOtro(d.material_nucleo, d.material_nucleo_otro) : VACIO],
  ['Color', tiene(d.color) ? d.color : VACIO],
  ['Ancho', conUnidad(d.ancho_banda, 'mm')],
  ['Largo (perímetro)', conUnidad(d.largo_total_perimetro, 'mm')],
  ['Espesor', conUnidad(tiene(d.espesor_total_dim) ? d.espesor_total_dim : d.espesor_total, 'mm')],
  ['Superficie de tracción', tiene(d.superficie_traccion) ? conOtro(d.superficie_traccion, d.superficie_traccion_otro) : VACIO],
  ['Superficie de carga', tiene(d.superficie_carga) ? conOtro(d.superficie_carga, d.superficie_carga_otro) : VACIO],
  ['Cantidad de bandas', tiene(d.cantidad_bandas) ? d.cantidad_bandas : VACIO],
  ['Empalme', unir([
    conOtro(d.tipo_empalme, d.tipo_empalme_otro),
    tiene(d.largo_empalme) ? `${d.largo_empalme} mm` : '',
    tiene(d.angulo_empalme) ? `${d.angulo_empalme}°` : '',
    d.lugar_empalme
  ])]
];

const filasModular = (d, esRadial) => {
  const conEmpujadores = d.empujadores === 'Sí';
  const conGuardas = d.guardas_laterales === 'Sí';
  const filas = [
    ['Tipo', esRadial ? 'Radial (curvas)' : 'Recta'],
    ['Serie / Estilo', unir([d.serie_intralox, conOtro(d.estilo, d.estilo_otro)])],
    ['Material', tiene(d.material) ? conOtro(d.material, d.material_otro) : VACIO],
    ['Color', tiene(d.color) ? d.color : VACIO],
    ['Ancho', conUnidad(d.ancho_banda, 'mm')],
    ['Largo (centro a centro)', conUnidad(d.largo_centro_centro, 'm')],
    ['Paso de la banda', conUnidad(d.paso_banda, 'mm')],
    ['Guías (guardas laterales)', conGuardas
      ? unir(['Sí', tiene(d.altura_guarda_lateral) ? `altura ${d.altura_guarda_lateral} mm` : ''])
      : (tiene(d.guardas_laterales) ? d.guardas_laterales : VACIO)],
    ['Empujadores', conEmpujadores
      ? unir([
        d.tipo_empujador,
        tiene(d.altura_empujador) ? `alto ${d.altura_empujador} mm` : '',
        tiene(d.ancho_empujador) ? `ancho ${d.ancho_empujador} mm` : '',
        tiene(d.espaciado_empujadores) ? `cada ${d.espaciado_empujadores} mm` : '',
        tiene(d.indentacion_empujadores) ? `indentación ${d.indentacion_empujadores} mm` : ''
      ])
      : (tiene(d.empujadores) ? 'Sin empujadores' : VACIO)]
  ];
  if (esRadial) filas.push(['Número de curvas', tiene(d.numero_curvas) ? d.numero_curvas : VACIO]);
  return filas;
};

const filasThermodrive = (d) => {
  const conEmpujadores = d.empujadores === 'Sí';
  const guardas = conOtro(d.guardas_laterales, d.guardas_laterales_otro);
  const conGuardas = tiene(d.guardas_laterales) && d.guardas_laterales !== 'Sin guardas';
  return [
    ['Serie / Estilo', unir([conOtro(d.serie_intralox, d.serie_intralox_otro), conOtro(d.estilo, d.estilo_otro)])],
    ['Material', tiene(d.material_banda) ? conOtro(d.material_banda, d.material_banda_otro) : VACIO],
    ['Color', tiene(d.color_superficie) ? d.color_superficie : VACIO],
    ['Ancho', conUnidad(d.ancho_banda, 'mm')],
    ['Largo (centro a centro)', conUnidad(d.largo_centro_centro, 'm')],
    ['Espesor', conUnidad(d.espesor_total, 'mm')],
    ['Paso de banda', conUnidad(d.paso_banda, 'mm')],
    ['Guías (guardas laterales)', conGuardas
      ? unir([guardas, tiene(d.altura_sidewall) ? `altura ${d.altura_sidewall} mm` : ''])
      : (tiene(d.guardas_laterales) ? d.guardas_laterales : VACIO)],
    ['Empujadores', conEmpujadores
      ? unir([
        d.tipo_empujador,
        tiene(d.altura_empujador) ? `alto ${d.altura_empujador} mm` : '',
        tiene(d.ancho_empujador) ? `ancho ${d.ancho_empujador} mm` : ''
      ])
      : (tiene(d.empujadores) ? 'Sin empujadores' : VACIO)],
    ['Temp. máx. de operación', conUnidad(d.temp_max_operacion, '°C')]
  ];
};

// tipo: 'transporte' | 'transmision' | 'modular' | 'thermodrive'
export function filasBandaAFabricar(tipo, datos, { esRadial = false } = {}) {
  const d = datos || {};
  switch (tipo) {
    case 'transporte': return filasTransporte(d);
    case 'transmision': return filasTransmision(d);
    case 'modular': return filasModular(d, esRadial);
    case 'thermodrive': return filasThermodrive(d);
    default: return [];
  }
}
