// Importar la clase necesaria de la librería discord.js
const { EmbedBuilder } = require("discord.js");

// Función asíncrona para manejar el comando /about
const handleAbout = async (interaction) => {
  try {
    const embed = new EmbedBuilder() // Crea un nuevo objeto EmbedBuilder
      .setColor("#ffffff") // Establece el color del embed a blanco
      .setTitle("About DealHunter Bot") // Establece el título del embed
      .setDescription("This bot helps you find great deals on games and notifies you about free games available!\n\u200B") // Establece la descripción del embed
      .addFields(
        // Añade un campo al embed con información sobre los comandos, el desarrollador, añadir el bot y contacto
        {
          name: "Commands", // Título del campo
          // Contenido del campo
          value:
            "/random_game - Shows a random game deal\n/free_game - Lists currently free games\n/settings - Configure your settings\n/about - Shows information about the bot\n\u200B",
        },
        {
          name: "Developer",
          value: "Developed by YiYang Ji (Johnny)\n[About website](https://www.google.com/)\n\u200B",
        },
        {
          name: "Add the Bot",
          value: "[Click here to add the bot to your server](https://discord.com/oauth2/authorize?client_id=1220283733400092692)\n\u200B",
        },
        {
          name: "Contact",
          value: "[Report a bug or get in contact for suggestions or feedback!](https://www.google.com/)\n\u200B",
        }
      )
      .setFooter({ text: "Powered By Data from RAWG.io and CheapShark.com" }); // Establece el pie de página del embed

    await interaction.reply({ embeds: [embed] }); // Devuelve el embed al canal de texto
  } catch (error) {
    console.error("Error handling about command:", error);
    await interaction.reply({ content: "There was an error while processing your command.", ephemeral: true }); // Devuelve un mensaje de error al usuario si ocurre un error
  }
};

module.exports = handleAbout; // Exporta la función handleAbout para que pueda ser utilizada en otros archivos
