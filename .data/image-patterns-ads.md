# Image Patterns — 100 Entornos Únicos para Ads (Ad Factory v2.0)

> Cada imagen debe ser COMPLETAMENTE DIFERENTE. Texto camuflado en objeto real, nunca overlay.

## 5 Reglas Inviolables

1. **CADA imagen COMPLETAMENTE DIFERENTE** — 100 ads = 100 escenas únicas
2. **Texto camuflado en objeto real** — servilleta, espejo, ticket, pizarra, cuaderno. NUNCA overlay
3. **El entorno = la vida del avatar** — empleado → oficina gris. Mamá → cocina argentina.
4. **Genera CURIOSIDAD** — "¿qué dice ahí?" o "¿qué le pasó?"
5. **Foto casual tipo iPhone** — NO estudio, NO stock. Imperfecciones naturales.

## JSON Spec para GPT-Image-1

```json
{
  "escena": {"fondo": "mesada de cocina argentina con azulejos", "iluminacion": "cálida natural de ventana", "angulo": "cenital"},
  "elemento_central": {"tipo": "objeto con texto", "descripcion": "dorso de recibo de sueldo arrugado"},
  "texto_en_escena": {"objeto": "dorso del recibo de sueldo", "texto": "¿Y SI RENUNCIO?", "escritura": "birome azul, letra apurada"},
  "contexto": "café a medio tomar, llaves, celular con notificación",
  "estilo": "foto casual tipo iPhone, no producida"
}
```

Parámetros: `model: gpt-image-1`, `size: 1024x1536`, `quality: high`.

---

## A. SUPERFICIES DE ESCRITURA (texto escrito a mano)
| # | Entorno | Avatar ideal | Texto ejemplo |
|---|---------|-------------|---------------|
| 1 | Dorso de recibo de sueldo | Empleado | "¿Y si renuncio?" |
| 2 | Servilleta de bar/café | Emprendedor | "La idea del millón" |
| 3 | Espejo empañado del baño | Cualquiera | "HOY EMPIEZO" |
| 4 | Margen de libro | Estudiante/lector | "Esto funciona →" |
| 5 | Cuaderno viejo rayado | Mamá/ama de casa | "Mis recetas venden" |
| 6 | Post-it en monitor | Oficinista | "RENUNCIO EN 30 DÍAS" |
| 7 | Pizarrón de cocina | Familia | "MENÚ SEMANAL APTO" |
| 8 | Arena de playa | Nómada digital | "OFICINA: 🌊" |
| 9 | Vidrio empañado de auto | Viajero | "NO VUELVO A LA OFICINA" |
| 10 | Envoltorio de alfajor | Argentino genérico | "Esto me pagó el alquiler" |

## B. DOCUMENTOS Y PAPELES
| # | Entorno | Avatar ideal | Texto ejemplo |
|---|---------|-------------|---------------|
| 11 | CV tachado con birome roja | Desempleado | "YA NO NECESITO ESTO" |
| 12 | Boleto de bondi/colectivo | Empleado | "ÚLTIMO VIAJE" |
| 13 | Ticket de supermercado | Ama de casa | "TOTAL: $28.500 — y si cocino?" |
| 14 | Factura de luz | Cualquiera | "la pago con 3 ventas" |
| 15 | Receta médica | Paciente/cuidador | "DIETA: ¿PERO QUÉ COMO?" |
| 16 | Diploma/título enmarcado | Profesional | Post-it: "¿Y la plata?" |
| 17 | Menú de restaurante | Diabético/celíaco | Signos ? al lado de platos |
| 18 | Lista de compras | Mamá/cuidador | "PARA PAPÁ — APTO DIABETES" |
| 19 | Contrato de alquiler | Joven/independiente | "RENOVAR?" al margen |
| 20 | Carta de renuncia a medio escribir | Empleado | "Estimados... BASTA" |

## C. PANTALLAS Y DISPOSITIVOS
| # | Entorno | Avatar ideal | Texto ejemplo |
|---|---------|-------------|---------------|
| 21 | Celular con notificación Hotmart | Vendedor digital | "Nueva venta — $4.500" |
| 22 | Laptop con dashboard de ventas | Emprendedor | Gráfico subiendo |
| 23 | Celular con WhatsApp abierto | Cualquiera | Chat con receta/respuesta |
| 24 | Tablet con ebook abierto | Creador | Portada de su producto |
| 25 | Computadora vieja con Excel | Empleado | Planilla de gastos deprimente |
| 26 | Celular con alarma 5:45AM | Empleado | Alarma + "NO MÁS" en post-it |
| 27 | Smart TV con Netflix pausado | Freelancer | "Mientras mirás, otros venden" |
| 28 | Celular con calculadora | Cualquiera | "$2.500 × 14 = $35.000" |
| 29 | Celular con Google "cómo ganar plata" | Buscador | Resultados de búsqueda |
| 30 | Monitor con Canva abierto | Creador | Portada de ebook en edición |

## D. OBJETOS COTIDIANOS
| # | Entorno | Avatar ideal | Texto ejemplo |
|---|---------|-------------|---------------|
| 31 | Taza de café con frase | Madrugador | "MI JEFE NO SABE ESTO" |
| 32 | Remera estampada | Joven | "VENDO MIENTRAS DUERMO" |
| 33 | Caja registradora | Negocio físico | "HOY: $12.000 / ONLINE: $47.000" |
| 34 | Bolsa de supermercado | Ama de casa | "$4.200 = 7 DÍAS APTO" |
| 35 | Dibujo de nene en la heladera | Mamá | "MAMÁ TRABAJA EN CASA ♥" |
| 36 | Etiqueta de tupper | Cuidador | "PAPÁ — LUNES — APTO DBT" |
| 37 | Pizarrón de bar/restaurante | Gastronómico | "HOY: PIZZA SIN GLUTEN" |
| 38 | Cartel de "SE ALQUILA" | Independiente | Post-it: "LO PAGO CON VENTAS" |
| 39 | Espejo de probador | Joven | "EN 6 MESES ESTO CAMBIA" |
| 40 | Globo de cumpleaños | Festivo | "58 AÑOS Y RECIÉN EMPIEZA" |

## E. ESCENAS SITUACIONALES
| # | Entorno | Situación | Por qué funciona |
|---|---------|-----------|-----------------|
| 41 | Persona en pantuflas frente a laptop | Trabajar desde casa | Contraste con oficina |
| 42 | Auto en ruta con laptop en capot | Nómada digital | Lo absurdo es memorable |
| 43 | Alguien en el baño con celular (de espaldas) | Ingreso pasivo | Humor + realidad |
| 44 | Persona en pijama mirando dashboard | Primer resultado | "Vendí dormida" |
| 45 | Reunión de Zoom aburrida, celular con Hotmart | Empleado harto | Doble vida secreta |
| 46 | Cola del banco con celular mostrando venta | Tiempo vs dinero | Contraste brutal |
| 47 | Persona en la playa con laptop | Libertad | Aspiracional pero real |
| 48 | Cocina desordenada con 5 tuppers etiquetados | Meal prep cuidador | Amor visible |
| 49 | Heladera abierta de noche, solo la luz | Diabético perdido | Emotivo, cinematográfico |
| 50 | Fila del supermercado con ticket larguísimo | Comida cara | Dolor visual |

## F. ESPACIOS DE TRABAJO
| # | Entorno | Texto/Situación |
|---|---------|-----------------|
| 51 | Escritorio gris a las 18:00 | Post-it: "Hoy es el día" |
| 52 | Mesa de cocina = oficina improvisada | Laptop entre platos |
| 53 | Balcón con mate y laptop | "Mi nueva oficina" en cartón |
| 54 | Cama deshecha con laptop | "5 ventas mientras dormía" en pantalla |
| 55 | Asiento de bondi con celular | Notificación de venta |
| 56 | Sala de espera de médico con celular | "Mientras esperás, vendés" |
| 57 | Banco de plaza con laptop | Libertad de ubicación |
| 58 | Silla de plástico en patio | Setup humilde pero funcional |
| 59 | Mesa de café con dos tazas | Reunión de emprendedores |
| 60 | Garage convertido en "oficina" | Cartón: "SEDE CENTRAL" |

## G. COMIDA Y SALUD (nicho nutrición)
| # | Entorno | Texto/Situación |
|---|---------|-----------------|
| 61 | Pizza de coliflor con banderita | "SÍ PODÉS" |
| 62 | Torta de cumpleaños con topper | "SIN AZÚCAR" |
| 63 | Milanesa napo con pizarrón | "SIN HARINA" |
| 64 | Empanadas con cartelito | "APTAS DIABETES" |
| 65 | Helado casero con pizarrita | "HECHO EN CASA" |
| 66 | Asado con cartel | "SIN SAL — CON CHIMICHURRI" |
| 67 | Flan con pizarrita | "SIN AZÚCAR" |
| 68 | Facturas con servilleta | "SIN AZÚCAR" |
| 69 | Alfajores con etiqueta kraft | "APTOS" |
| 70 | Hamburguesa con banderita | "APTA DBT" |

## H. MOMENTOS EMOCIONALES
| # | Entorno | Situación |
|---|---------|-----------|
| 71 | Manos de señora con celular en patio | "58 años y vendió 7 guías" |
| 72 | Persona mirando amanecer desde ventana | Nuevo comienzo |
| 73 | Glucómetro verde al lado de plato | Resultado positivo |
| 74 | Cuaderno con recetas tachadas | Frustración del cuidador |
| 75 | Calculadora + boletas sobre mesa | Angustia financiera |
| 76 | Persona abrazando caja de Correo | Primer envío |
| 77 | Llaves de depto nuevo sobre mesa | "Lo compré con ventas" |
| 78 | Maleta abierta con laptop adentro | Viaje + trabajo |
| 79 | Hijo dibujando mientras mamá en laptop | Balance real |
| 80 | Persona llorando de alegría mirando celular | Primera venta |

## I. CONTRASTES ANTES/DESPUÉS
| # | Entorno | Contraste |
|---|---------|-----------|
| 81 | Pechuga hervida / pollo con hierbas | "Sin sal ≠ sin sabor" |
| 82 | Oficina gris / playa con laptop | "Antes vs después" |
| 83 | Producto industrial caro / casero barato | "$3.500 vs $400" |
| 84 | Alarma 5:45 / despertarse sin alarma | Libertad de horario |
| 85 | Cola del banco / celular con venta | Tiempo |
| 86 | CV impreso / laptop con Hotmart | Forma de ganar plata |
| 87 | Plato aburrido / mismo plato rico | Misma restricción, otra preparación |
| 88 | Changuito caro / mesada con ingredientes | "Super vs casero" |
| 89 | Reloj de fichaje / reloj en playa | Control del tiempo |
| 90 | Búsqueda google confusa / chat WhatsApp claro | Información |

## J. ENTORNOS INESPERADOS
| # | Entorno | Por qué funciona |
|---|---------|-----------------|
| 91 | Baldosa de vereda con tiza | Parada de bondi — masivo |
| 92 | Mandil de carnicero con marcador | Nicho gastronómico |
| 93 | Yeso de brazo con birome | Recuperación/segunda oportunidad |
| 94 | Mantel de pizzería con birome | Idea de negocio en la servilleta |
| 95 | Barrera de estacionamiento | "SALIDA → A TU NEGOCIO" |
| 96 | Rayuela dibujada en piso | Nostalgia + nuevo camino |
| 97 | Etiqueta de ropa con precio | "Esto lo pago con 1 venta" |
| 98 | Cartón de huevos con marcador | Creatividad extrema |
| 99 | Reverso de foto vieja | Nostalgia + mensaje al futuro |
| 100 | Calco/sticker pegado en notebook | "PRODUCTS SELL WHILE I SLEEP" |

---

## Mapeo Entorno → Avatar ADP

| Avatar ADP | Entornos ideales |
|-----------|-----------------|
| Patricia (48, empleada) | 1, 6, 11, 12, 25, 26, 45, 51, 75 |
| Roberto (62, jubilado) | 5, 14, 36, 40, 48, 58, 71, 73, 74 |
| Laura (38, mamá) | 5, 13, 34, 35, 48, 52, 79, 62, 64 |
| Martín (26, oficinista) | 6, 12, 26, 29, 44, 45, 51, 55, 86 |
| Valentina (32, freelancer) | 2, 8, 22, 30, 42, 47, 53, 57, 78 |
| Diego (44, escéptico) | 1, 11, 16, 20, 25, 33, 38, 75, 82 |
| Camila (29, inmigrante) | 19, 29, 39, 44, 46, 52, 77, 80, 97 |
| Soledad (41, profesional) | 16, 22, 24, 30, 52, 59, 76, 78, 86 |
