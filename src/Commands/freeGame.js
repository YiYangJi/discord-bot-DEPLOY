// Importar la clase necesaria de la librería discord.js
const { EmbedBuilder } = require("discord.js");
// Importar la función asíncrona getFreeGames de AsyncFunctions.js
const { getFreeGames } = require("../Services/AsyncFunctions");

// Función asíncrona para manejar el comando /free_game
const handleFreeGame = async (interaction) => {
  try {
    await interaction.deferReply(); // Retrasa la respuesta para evitar errores de tiempo de espera (3 segundos sin esta función)
    const games = await getFreeGames(); // Obtiene los juegos gratuitos de la función getFreeGames
    // Mapea los juegos gratuitos y crea una descripción con el título, el precio normal y un enlace al juego
    const description = games
      .map(
        (game) =>
          `[**${game.title}**](https://www.cheapshark.com/redirect?dealID=${game.dealID}) \nFree to play! **·** Normal Price: ~~${game.normalPrice}€~~`
      )
      .join("\n\n");
    const embed = new EmbedBuilder().setTitle("Currently Free Games").setDescription(description); // Crea un nuevo objeto EmbedBuilder con el título y la descripción
    await interaction.followUp({ embeds: [embed] }); // Devuelve el embed al canal de texto
  } catch (error) {
    await interaction.followUp({ content: "There was an error while processing your command.", ephemeral: true }); // Devuelve un mensaje de error al usuario si ocurre un error
  }
};

module.exports = handleFreeGame; // Exporta la función handleFreeGame para que pueda ser utilizada en otros archivos
