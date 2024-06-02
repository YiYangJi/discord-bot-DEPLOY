// Importar la clase necesaria de la librería discord.js
const { EmbedBuilder } = require("discord.js");

// Importar las funciones asíncronas necesarias de AsyncFunctions.js
const { getListDeals, searchGame, searchGameInfo } = require("../Services/AsyncFunctions");
// Importar el array de plataformas de juegos de StoresArray.js
const storesArray = require("../Services/StoresArray");

// Función asíncrona para manejar el comando /random_game
const handleRandomGame = async (interaction) => {
  try {
    await interaction.deferReply(); // Retrasa la respuesta para evitar errores de tiempo de espera (3 segundos sin esta función)

    const games = await getListDeals(); // Obtiene la lista de ofertas de la función getListDeals
    const randomGame = games[Math.floor(Math.random() * games.length)]; // Obtiene un juego aleatorio de la lista de ofertas

    const gameSearchResult = await searchGame(randomGame.title); // Busca el juego en la API de RAWG.io
    const gameInfo = await searchGameInfo(gameSearchResult.results[0].id); // Obtiene información específica del juego

    const store = storesArray.find((store) => store.storeID === randomGame.storeID); // Busca la tienda del juego en el array de tiendas

    const embed = new EmbedBuilder() // Crea un nuevo objeto EmbedBuilder
      .setDescription(`[**${randomGame.title}**](https://www.cheapshark.com/redirect?dealID=${randomGame.dealID})`) // Establece la descripción del embed con un enlace al juego
      .addFields(
        { name: "Sale Price", value: `${randomGame.salePrice}€`, inline: true }, // Añade un campo con el precio de venta
        { name: "Normal Price", value: `~~${randomGame.normalPrice}€~~`, inline: true } // Añade un campo con el precio normal
      )
      .setAuthor({ name: store.storeName, iconURL: `https://www.cheapshark.com/img/stores/logos/${store.banner}` }) // Establece el autor del embed con el nombre de la tienda y su logotipo
      .setImage(gameInfo ? gameInfo.background_image : "../img/logo_DealHunter-bg.png") // Establece la imagen del juego en el embed
      .setFooter({ text: "Powered by RAWG.io and CheapShark.com" }); // Establece el pie de página del embed

    await interaction.followUp({ embeds: [embed] }); // Devuelve el embed al canal de texto
  } catch (error) {
    await interaction.followUp({ content: "There was an error while processing your command.", ephemeral: true }); // Devuelve un mensaje de error al usuario si ocurre un error (solo visible para el usuario)
  }
};

module.exports = handleRandomGame; // Exporta la función handleRandomGame para que pueda ser utilizada en otros archivos
