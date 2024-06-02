// Importar las variables de entorno
require("dotenv").config();

// URL base para obtener ofertas de CheapShark
const listDeals = "https://www.cheapshark.com/api/1.0/deals";

// Función asíncrona para obtener una lista de ofertas
async function getListDeals() {
  try {
    const urlFetch = listDeals;
    const response = await fetch(urlFetch);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Error fetching list deals:", error);
    return [];
  }
}

// Función asíncrona para obtener una lista de juegos gratuitos
async function getFreeGames() {
  try {
    const urlFetch = listDeals + `?upperPrice=0`;
    const response = await fetch(urlFetch);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Error fetching free games:", error);
    return [];
  }
}

///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
// Obtiene la clave API de RAWG desde las variables de entorno
const apiRAWGKey = process.env.RAWG_API_KEY;

// URL base para buscar juegos en la API de RAWG
const searchGames = `https://api.rawg.io/api/games`;

// Función asíncrona para buscar un juego por su nombre
async function searchGame(name) {
  try {
    const urlFetch = searchGames + `?key=${apiRAWGKey}&search=${name}&page_size=1`;
    const response = await fetch(urlFetch);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Error fetching game searched:", error);
    return [];
  }
}

// Función asíncrona para obtener información detallada de un juego por su ID
async function searchGameInfo(id) {
  try {
    const urlFetch = searchGames + `/${id}?key=${apiRAWGKey}`;
    const response = await fetch(urlFetch);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Error fetching game info:", error);
    return [];
  }
}

// Exporta las funciones para que puedan ser utilizadas en otros archivos
module.exports = { getListDeals, getFreeGames, searchGame, searchGameInfo };
