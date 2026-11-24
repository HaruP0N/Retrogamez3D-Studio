export const SITE = {
  name: "RetroGamez3D",
  whatsapp: "56912345678",
  whatsappLabel: "+56 9 1234 5678",
  instagram: "retrogamez3d",
  email: "contacto@retrogamez3d.cl",
};

export const waLink = (text = "Hola! Quiero hacer una consulta") =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;

export const igLink = "https://www.instagram.com/retrogamez3d/";
